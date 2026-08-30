const MutationSets = {
    RoseDarkening: {
        Id: 1,
        Name: "Rose darkening",

        Description:
            "A mutation that seems to corrupt roses.",

        Chance: 0.1,
        Cooldown: 120000,

        Relations: {
            PlantsUsed: [
                1
            ],

            PlantsCreated: [
                2
            ]
        },

        Pattern: [
            [
                {
                    Tags: ["Rose"],
                    Capture: "ParentA"
                },
                "Empty"
            ],

            [
                "Empty",
                {
                    Tags: ["Rose"],
                    Capture: "ParentB"
                }
            ]
        ],

        Success: [
            [
                "Empty",
                "DarkRose"
            ],

            [
                "DarkRose",
                "Empty"
            ]
        ],

        Failure: "Keep"
    },

    RoseDyePurple: {
        Id: 2,
        Name: "Rose dying purple",

        Description:
            "A colourful mutation that makes a purple rose.",

        Chance: 1.0,
        Cooldown: 100000,

        Relations: {
            PlantsUsed: [
                1,
                3
            ],

            PlantsCreated: [
                4
            ]
        },

        Pattern: [
            [
                {
                    Tags: [
                        "Rose",
                        "Red"
                    ],
                    Capture: "ParentA"
                },

                "Empty",

                {
                    Tags: [
                        "Rose",
                        "Blue"
                    ],
                    Capture: "ParentB"
                }
            ]
        ],

        Success: [
            [
                "Empty",
                "PurpleRose",
                "Empty"
            ]
        ],

        Failure: "Keep"
    }
};
