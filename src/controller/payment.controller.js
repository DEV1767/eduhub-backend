import mongoose from "mongoose";
import Registration from "../model/registraton.model.js"
import cloudinary from "../config/cloudinary.js";

export const UpiPaymentProof = async (req, res) => {
    try {
        const { regId } = req.params;
        const { paymentMethod } = req.body;

        if (!mongoose.Types.ObjectId.isValid(regId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration ID"
            })
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Payment proof image is required"
            })
        }
        const registration = await Registration.findById(regId)
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            })
        }
        if (registration.registeredBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not allowed"
            })
        }

        // Upload payment proof image to Cloudinary
        return new Promise((resolve) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "payment_proofs" },
                async (error, result) => {
                    if (error) {
                        return resolve(res.status(500).json({
                            success: false,
                            message: "Image upload failed"
                        }))
                    }

                    try {
                        registration.paymentProofUrl = result.secure_url;
                        registration.paymentMethod = paymentMethod || "UPI"
                        registration.paymentStatus = "submitted"
                        registration.submittedAt = new Date()
                        await registration.save()

                        return resolve(res.status(200).json({
                            success: true,
                            message: "Payment proof submitted successfully",
                            paymentDetails: {
                                registrationId: registration._id,
                                paymentProofUrl: registration.paymentProofUrl,
                                paymentMethod: registration.paymentMethod,
                                paymentStatus: registration.paymentStatus,
                                submittedAt: registration.submittedAt
                            }
                        }))
                    } catch (dbError) {
                        console.error(dbError)
                        return resolve(res.status(500).json({
                            success: false,
                            message: "Failed to save payment details"
                        }))
                    }
                }
            )
            stream.end(req.file.buffer)
        })
    } catch (error) {
        console.error("Payment error :", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const approveupiPayment = async (req, res) => {
    try {
        const { regid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(regid)) {
            return res.status(404).json({
                success: false,
                message: "Invalid registration Id"
            })
        }
        const registration = await Registration.findById(regid)
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            })
        }

        registration.paymentStatus = "approved"
        registration.isPaymentVerified = true
        registration.approvedAt = new Date()
        registration.approvedBy = req.user._id
        await registration.save()
        return res.status(200).json({
            success: true,
            message: "Payment Approved"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const rejectupiPayment = async (req, res) => {
    try {
        const { regid } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(regid)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Id"
            })
        }
        const registration = await Registration.findById(regid)
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            })
        }

        registration.paymentStatus = "rejected"
        registration.isPaymentVerified = false
        registration.rejectedAt = new Date()
        registration.rejectionReason = reason || "Payment rejected by organizer"
        registration.approvedBy = req.user._id
        await registration.save()
        return res.status(200).json({
            success: true,
            message: "Payment Rejected"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getpaymentstatus = async (req, res) => {
    try {
        const { regid } = req.params
        if (!mongoose.Types.ObjectId.isValid(regid)) {
            return res.status(404).json({
                success: false,
                message: "registration id is not valid"
            })
        }
        const registration = await Registration.findById(regid)
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration  not found"
            })
        }
        return res.status(200).json({
            success: true,
            paymentDetails: {

                paymentStatus: registration.paymentStatus,
                paymentMethod: registration.paymentMethod,
                paymentProofUrl: registration.paymentProofUrl,
            }
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}