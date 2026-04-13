// models/Event.js

import mongoose from "mongoose";


// Coordinator
const coordinatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      lowercase: true,
      default: ""
    }
  },
  { _id: false }
);

const linkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      default: ""
    },
    url: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    q: {
      type: String,
      trim: true,
      default: ""
    },
    a: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { _id: false }
);

const infoSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      default: ""
    },
    eligibility: {
      type: String,
      default: ""
    },
    coordinator: {
      type: coordinatorSchema,
      default: () => ({})
    },
    links: {
      type: [linkSchema],
      default: []
    },
    faqs: {
      type: [faqSchema],
      default: []
    }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["Hackathon", "Quiz", "Cultural", "Techtalk", "Sports"],
      required: true
    },

    status: {
      type: String,
      enum: ["Upcoming", "Live", "Completed"],
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    time: {
      type: String
    },

    venue: {
      type: String,
      trim: true
    },

    maxTeams: {
      type: Number
    },

    prize: {
      type: String
    },

    description: {
      type: String
    },

    teams: {
      type: Number,
      default: 0
    },

    collegename: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    rules: {
      type: String,
      default: ""
    },

    rulesVisible: {
      type: Boolean,
      default: true
    },

    info: {
      type: infoSchema,
      default: () => ({})
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Event", eventSchema);