let ProfileSave = null;


async function StartProfile() {
    await RenderProfilePlayer();

    try {
        await LoadGameContent();

        ProfileSave =
            await LoadGame();

        RenderProfileStatistics();
        RenderGardenDisplayPreferences();
        BindGardenDisplayPreferences();
    } catch (Error) {
        console.error(
            "Couldn't load profile statistics:",
            Error
        );

        RenderProfileStatisticsError();
    }

    const UsernameForm =
        document.getElementById(
            "ProfileUsernameForm"
        );

    UsernameForm.addEventListener(
        "submit",
        SubmitProfileUsername
    );

    const ColourForm =
        document.getElementById(
            "ProfileColourForm"
        );

    const ColourInput =
        document.getElementById(
            "ProfileColourInput"
        );

    const ColourPreview =
        document.getElementById(
            "ProfileColourPreview"
        );

    const ResetColourButton =
        document.getElementById(
            "ResetProfileColourButton"
        );

    ColourForm.addEventListener(
        "submit",
        SubmitProfileColour
    );

    ColourInput.addEventListener(
        "input",
        () => {
            ApplyPlayerColour(
                ColourPreview,
                ColourInput.value
            );
        }
    );

    ResetColourButton.addEventListener(
        "click",
        ResetProfileColour
    );
}


function BindGardenDisplayPreferences() {
    const PreferenceButtons = [
        [
            "ToggleSelectQuickBoughtPlantButton",
            "SelectQuickBoughtPlant"
        ],
        [
            "ToggleSelectTrowelWithInventoryPlantButton",
            "SelectTrowelWithInventoryPlant"
        ],
        [
            "TogglePlantNamesButton",
            "ShowPlantNames"
        ],
        [
            "ToggleGrowthTimersButton",
            "ShowGrowthTimers"
        ],
        [
            "ToggleNextHarvestButton",
            "ShowNextHarvest"
        ],
        [
            "ToggleGardenSizeButton",
            "ShowGardenSize"
        ],
        [
            "ToggleEmptyPlotsButton",
            "ShowEmptyPlots"
        ],
        [
            "TogglePlantedPlotsButton",
            "ShowPlantedPlots"
        ],
        [
            "ToggleGrowingPlotsButton",
            "ShowGrowingPlots"
        ],
        [
            "ToggleReadyPlotsButton",
            "ShowReadyPlots"
        ]
    ];


    for (
        const [
            ButtonId,
            PreferenceName
        ]
        of PreferenceButtons
    ) {
        const Button =
            document.getElementById(
                ButtonId
            );

        if (Button === null) {
            continue;
        }

        Button.addEventListener(
            "click",
            () => {
                ToggleGardenDisplayPreference(
                    PreferenceName
                );
            }
        );
    }
}


function RenderGardenDisplayPreferences() {
    RenderToolSelectionPreferences();
    RenderPlantInformationPreferences();
    RenderGardenOverviewPreferences();
}


function RenderToolSelectionPreferences() {
    const QuickBuyButton =
        document.getElementById(
            "ToggleSelectQuickBoughtPlantButton"
        );

    const TrowelButton =
        document.getElementById(
            "ToggleSelectTrowelWithInventoryPlantButton"
        );

    if (
        QuickBuyButton === null ||
        TrowelButton === null
    ) {
        return;
    }


    SetPreferenceButtonState(
        QuickBuyButton,
        "Select bought plant when you quick-buy one",
        ProfileSave.Preferences
            .SelectQuickBoughtPlant !==
            false
    );

    SetPreferenceButtonState(
        TrowelButton,
        "Select trowel when you select an inventory plant",
        ProfileSave.Preferences
            .SelectTrowelWithInventoryPlant !==
            false
    );
}


function RenderPlantInformationPreferences() {
    const PlantNamesButton =
        document.getElementById(
            "TogglePlantNamesButton"
        );

    const GrowthTimersButton =
        document.getElementById(
            "ToggleGrowthTimersButton"
        );

    const Message =
        document.getElementById(
            "GardenDisplayMessage"
        );

    if (
        PlantNamesButton === null ||
        GrowthTimersButton === null ||
        Message === null
    ) {
        return;
    }


    const IsOwned =
        HasPlantInformationUpgrade(
            ProfileSave
        );

    if (!IsOwned) {
        SetPreferenceButtonState(
            PlantNamesButton,
            "Plant names",
            false,
            true
        );

        SetPreferenceButtonState(
            GrowthTimersButton,
            "Growth timers",
            false,
            true
        );

        Message.textContent =
            "Unlock Plant information in the Shop to use these settings.";

        return;
    }


    SetPreferenceButtonState(
        PlantNamesButton,
        "Plant names",
        ProfileSave.Preferences
            .ShowPlantNames !== false
    );

    SetPreferenceButtonState(
        GrowthTimersButton,
        "Growth timers",
        ProfileSave.Preferences
            .ShowGrowthTimers !== false
    );

    Message.textContent =
        "Plant names and growth timers can be changed independently.";
}


function RenderGardenOverviewPreferences() {
    const Settings = [
        [
            "ToggleNextHarvestButton",
            "Next harvest",
            "ShowNextHarvest"
        ],
        [
            "ToggleGardenSizeButton",
            "Garden size",
            "ShowGardenSize"
        ],
        [
            "ToggleEmptyPlotsButton",
            "Empty plots",
            "ShowEmptyPlots"
        ],
        [
            "TogglePlantedPlotsButton",
            "Planted plots",
            "ShowPlantedPlots"
        ],
        [
            "ToggleGrowingPlotsButton",
            "Growing",
            "ShowGrowingPlots"
        ],
        [
            "ToggleReadyPlotsButton",
            "Ready to harvest",
            "ShowReadyPlots"
        ]
    ];

    const Message =
        document.getElementById(
            "GardenOverviewDisplayMessage"
        );

    if (Message === null) {
        return;
    }


    const IsOwned =
        HasGardenOverviewUpgrade(
            ProfileSave
        );

    for (
        const [
            ButtonId,
            Label,
            PreferenceName
        ]
        of Settings
    ) {
        const Button =
            document.getElementById(
                ButtonId
            );

        if (Button === null) {
            continue;
        }

        SetPreferenceButtonState(
            Button,
            Label,
            ProfileSave.Preferences[
                PreferenceName
            ] !== false,
            !IsOwned
        );
    }


    Message.textContent =
        IsOwned
            ? "Every Garden overview line can be changed independently."
            : "Unlock Garden overview in the Shop to use these settings.";
}


function SetPreferenceButtonState(
    Button,
    Label,
    IsEnabled,
    IsLocked = false
) {
    Button.disabled = IsLocked;

    Button.textContent =
        Label +
        ": " +
        (IsLocked
            ? "Locked"
            : IsEnabled
                ? "On"
                : "Off");
}


async function ToggleGardenDisplayPreference(
    PreferenceName
) {
    const ToolSelectionPreferences = [
        "SelectQuickBoughtPlant",
        "SelectTrowelWithInventoryPlant"
    ];

    const PlantInformationPreferences = [
        "ShowPlantNames",
        "ShowGrowthTimers"
    ];

    const GardenOverviewPreferences = [
        "ShowNextHarvest",
        "ShowGardenSize",
        "ShowEmptyPlots",
        "ShowPlantedPlots",
        "ShowGrowingPlots",
        "ShowReadyPlots"
    ];


    const IsToolSelectionPreference =
        ToolSelectionPreferences.includes(
            PreferenceName
        );

    const IsPlantInformationPreference =
        PlantInformationPreferences.includes(
            PreferenceName
        );

    const IsGardenOverviewPreference =
        GardenOverviewPreferences.includes(
            PreferenceName
        );


    if (
        !IsToolSelectionPreference &&
        !IsPlantInformationPreference &&
        !IsGardenOverviewPreference
    ) {
        return;
    }

    if (
        IsPlantInformationPreference &&
        !HasPlantInformationUpgrade(
            ProfileSave
        )
    ) {
        return;
    }

    if (
        IsGardenOverviewPreference &&
        !HasGardenOverviewUpgrade(
            ProfileSave
        )
    ) {
        return;
    }


    ProfileSave.Preferences[
        PreferenceName
    ] = !ProfileSave.Preferences[
        PreferenceName
    ];

    RenderGardenDisplayPreferences();

    await SaveGame(
        ProfileSave
    );
}


async function RenderProfilePlayer() {
    const UsernameInput =
        document.getElementById(
            "ProfileUsernameInput"
        );

    const ColourInput =
        document.getElementById(
            "ProfileColourInput"
        );

    const ColourPreview =
        document.getElementById(
            "ProfileColourPreview"
        );

    const UsernameMessage =
        document.getElementById(
            "ProfileUsernameMessage"
        );

    try {
        const Profile =
            await GetProfile();

        if (!Profile.Success) {
            throw new Error(
                Profile.Error ??
                "Couldn't load profile."
            );
        }


        if (
            Profile.Username !== null
        ) {
            UsernameInput.value =
                Profile.Username;

            ColourPreview.textContent =
                Profile.Username;
        } else {
            ColourPreview.textContent =
                "Preview";
        }


        const ProfileColour =
            IsValidPlayerColour(
                Profile.Colour
            )
                ? Profile.Colour
                : DefaultColourPickerValue;

        ColourInput.value =
            ProfileColour;

        ApplyPlayerColour(
            ColourPreview,
            IsValidPlayerColour(
                Profile.Colour
            )
                ? Profile.Colour
                : null
        );


        UsernameMessage.textContent =
            "";
    } catch (Error) {
        console.error(
            "Couldn't load profile:",
            Error
        );

        UsernameMessage.textContent =
            "Couldn't load profile.";
    }
}


async function SubmitProfileUsername(
    Event
) {
    Event.preventDefault();

    const Input =
        document.getElementById(
            "ProfileUsernameInput"
        );

    const Message =
        document.getElementById(
            "ProfileUsernameMessage"
        );

    const Username =
        Input.value.trim();


    if (
        Username.length < 3 ||
        Username.length > 24
    ) {
        Message.textContent =
            "Username must be between 3 and 24 characters.";

        return;
    }


    Message.textContent =
        "Saving...";


    try {
        const Result =
            await SetUsername(
                Username
            );

        if (!Result.Success) {
            Message.textContent =
                Result.Error ??
                "Couldn't change username.";

            return;
        }

        Input.value =
            Username;

        Message.textContent =
            "Username saved.";
    } catch (Error) {
        console.error(
            "Couldn't change username:",
            Error
        );

        Message.textContent =
            "Couldn't change username.";
    }
}

async function SubmitProfileColour(
    Event
) {
    Event.preventDefault();

    const Input =
        document.getElementById(
            "ProfileColourInput"
        );

    const Preview =
        document.getElementById(
            "ProfileColourPreview"
        );

    const Message =
        document.getElementById(
            "ProfileColourMessage"
        );


    Message.textContent =
        "Saving...";


    try {
        const Result =
            await SetColour(
                Input.value
            );

        if (!Result.Success) {
            Message.textContent =
                Result.Error ??
                "Couldn't save colour.";

            return;
        }


        ApplyPlayerColour(
            Preview,
            IsValidPlayerColour(
                Result.Colour
            )
                ? Result.Colour
                : Input.value
        );

        Message.textContent =
            "Colour saved.";
    } catch (Error) {
        console.error(
            "Couldn't save colour:",
            Error
        );

        Message.textContent =
            "Couldn't save colour.";
    }
}


async function ResetProfileColour() {
    const Input =
        document.getElementById(
            "ProfileColourInput"
        );

    const Preview =
        document.getElementById(
            "ProfileColourPreview"
        );

    const Message =
        document.getElementById(
            "ProfileColourMessage"
        );


    try {
        const Result =
            await SetColour(
                null
            );

        if (!Result.Success) {
            Message.textContent =
                Result.Error ??
                "Couldn't reset colour.";

            return;
        }


        Input.value =
            DefaultColourPickerValue;

        ApplyPlayerColour(
            Preview,
            null
        );

        Message.textContent =
            "Colour reset.";
    } catch (Error) {
        console.error(
            "Couldn't reset colour:",
            Error
        );

        Message.textContent =
            "Couldn't reset colour.";
    }
}

function RenderProfileStatistics() {
    const CurrentDew =
        ProfileSave
            ?.Currency
            ?.Dew ??
        0;

    const LifetimeDew =
        ProfileSave
            ?.Statistics
            ?.CurrencyEarned
            ?.Dew ??
        CurrentDew;

    const PlantsDiscovered =
        ProfileSave
            ?.Discoveries
            ?.Plants
            ?.length ??
        0;

    const MutationsDiscovered =
        ProfileSave
            ?.Discoveries
            ?.Mutations
            ?.length ??
        0;

    const GardenWidth =
        ProfileSave
            ?.Garden
            ?.Width ??
        0;

    const GardenHeight =
        ProfileSave
            ?.Garden
            ?.Height ??
        0;


    SetProfileStatistic(
        "ProfileCurrentDew",
        FormatProfileNumber(
            CurrentDew
        )
    );

    SetProfileStatistic(
        "ProfileLifetimeDew",
        FormatProfileNumber(
            LifetimeDew
        )
    );

    SetProfileStatistic(
        "ProfilePlantsDiscovered",
        FormatProfileNumber(
            PlantsDiscovered
        )
    );

    SetProfileStatistic(
        "ProfileMutationsDiscovered",
        FormatProfileNumber(
            MutationsDiscovered
        )
    );

    SetProfileStatistic(
        "ProfileGardenSize",
        GardenWidth +
        "×" +
        GardenHeight
    );
}


function RenderProfileStatisticsError() {
    const StatisticIds = [
        "ProfileCurrentDew",
        "ProfileLifetimeDew",
        "ProfilePlantsDiscovered",
        "ProfileMutationsDiscovered",
        "ProfileGardenSize"
    ];

    for (
        const StatisticId
        of StatisticIds
    ) {
        SetProfileStatistic(
            StatisticId,
            "?"
        );
    }
}


function SetProfileStatistic(
    ElementId,
    Value
) {
    const Element =
        document.getElementById(
            ElementId
        );

    if (Element === null) {
        return;
    }

    Element.textContent =
        Value;
}


function FormatProfileNumber(
    Number
) {
    return Number.toLocaleString();
}


document.addEventListener(
    "DOMContentLoaded",
    StartProfile
);
