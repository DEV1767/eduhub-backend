
//To generate jwt token

import Users from "../model/user.model.js";

export const generateTokens = async (userId) => {
    try {
        const user = await Users.findById(userId);

        if (!user) {
            throw new Error("User not found while generating tokens");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new Error(`Token generation failed: ${error.message}`);
    }
};

