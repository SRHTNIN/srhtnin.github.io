const MutationSets = {
    DarkRose: {
        Name: "Dark Rose",

        Chance: 0.1,
        Cooldown: 120000,

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
    }
};
