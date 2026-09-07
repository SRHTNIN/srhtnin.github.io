let ProfileSave = null;
let ProfileData = null;
let ProfilePictureSearchQuery = "";
let ProfilePictureSortMode = "IdAsc";
let ProfilePictureSelectedPlantKey = null;
let ProfilePictureSelectedGrowthStage = null;

const DefaultGardenerSettings = {
    AllowGardenPreviews: true,
    AllowComments: true,
    AllowDewDonations: true,
    ShowStats: true
};


async function StartProfile() {
    await RenderProfilePlayer();

    const UsernameForm =
        document.getElementById(
            "ProfileUsernameForm"
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

    const DescriptionForm =
        document.getElementById(
            "ProfileDescriptionForm"
        );


    UsernameForm?.addEventListener(
        "submit",
        SubmitProfileUsername
    );

    ColourForm?.addEventListener(
        "submit",
        SubmitProfileColour
    );

    ColourInput?.addEventListener(
        "input",
        () => {
            if (ColourPreview === null) {
                return;
            }

            ApplyPlayerColour(
                ColourPreview,
                ColourInput.value
            );
        }
    );

    ResetColourButton?.addEventListener(
        "click",
        ResetProfileColour
    );

    DescriptionForm?.addEventListener(
        "submit",
        SubmitProfileDescription
    );

    BindProfilePrivacySettings();


    try {
        await LoadGameContent();

        ProfileSave =
            await LoadGame();

        RenderProfileStatistics();
        RenderGardenDisplayPreferences();
        BindGardenDisplayPreferences();
        InitialiseProfilePictureChooser();
    } catch (Error) {
        console.error(
            "Couldn't load profile statistics:",
            Error
        );

        RenderProfileStatisticsError();
        SetProfilePictureCatalogueMessage(
            "Couldn't load your discovered plants."
        );
    }
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
            "TogglePlotRotationButton",
            "ShowPlotRotation"
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
    RenderPlotRotationPreference();
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


function RenderPlotRotationPreference() {
    const Button =
        document.getElementById(
            "TogglePlotRotationButton"
        );

    const Message =
        document.getElementById(
            "PlotRotationDisplayMessage"
        );

    if (
        Button === null ||
        Message === null
    ) {
        return;
    }

    const IsOwned =
        HasRotationUpgrade(
            ProfileSave
        );

    SetPreferenceButtonState(
        Button,
        "Plot rotation",
        ProfileSave.Preferences
            .ShowPlotRotation !== false,
        !IsOwned
    );

    Message.textContent =
        IsOwned
            ? "Plot directions can be hidden without changing their saved rotation."
            : "Unlock Plot rotation in the Shop to use this setting.";
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

    const RotationPreferences = [
        "ShowPlotRotation"
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

    const IsRotationPreference =
        RotationPreferences.includes(
            PreferenceName
        );

    const IsGardenOverviewPreference =
        GardenOverviewPreferences.includes(
            PreferenceName
        );


    if (
        !IsToolSelectionPreference &&
        !IsPlantInformationPreference &&
        !IsRotationPreference &&
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
        IsRotationPreference &&
        !HasRotationUpgrade(
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


        ProfileData = Profile;
        RenderProfileDescription();
        RenderProfilePrivacySettings();


        if (
            typeof Profile.Username ===
                "string" &&
            Profile.Username.length > 0
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

function RenderProfileDescription() {
    const Input =
        document.getElementById(
            "ProfileDescriptionInput"
        );

    if (Input === null) {
        return;
    }

    Input.value =
        typeof ProfileData?.Description ===
            "string"
                ? ProfileData.Description
                : "";
}


async function SubmitProfileDescription(
    Event
) {
    Event.preventDefault();

    const Input =
        document.getElementById(
            "ProfileDescriptionInput"
        );

    const Message =
        document.getElementById(
            "ProfileDescriptionMessage"
        );

    if (
        Input === null ||
        Message === null
    ) {
        return;
    }

    const Description =
        Input.value.trim();

    if (
        Array.from(
            Description
        ).length > 500
    ) {
        Message.textContent =
            "Description must be 500 characters or fewer.";

        return;
    }

    Message.textContent =
        "Saving...";

    try {
        const Result =
            await SetUserConfig({
                Description: Description
            });

        if (!Result.Success) {
            Message.textContent =
                Result.Error ??
                "Couldn't save description.";

            return;
        }

        ProfileData ??= {};
        ProfileData.Description =
            Result.Description ??
            Description;

        Input.value =
            ProfileData.Description;

        Message.textContent =
            "Description saved.";
    } catch (Error) {
        console.error(
            "Couldn't save profile description:",
            Error
        );

        Message.textContent =
            "Couldn't save description.";
    }
}


function GetGardenerSettings() {
    const StoredSettings =
        ProfileData?.Settings !== null &&
        typeof ProfileData?.Settings ===
            "object" &&
        !Array.isArray(
            ProfileData.Settings
        )
            ? ProfileData.Settings
            : {};

    return {
        ...DefaultGardenerSettings,
        ...StoredSettings
    };
}


function BindProfilePrivacySettings() {
    const Settings = [
        [
            "ToggleGardenPreviewsButton",
            "AllowGardenPreviews"
        ],
        [
            "ToggleCommentsButton",
            "AllowComments"
        ],
        [
            "ToggleDewDonationsButton",
            "AllowDewDonations"
        ],
        [
            "ToggleProfileStatsButton",
            "ShowStats"
        ]
    ];

    for (
        const [
            ButtonId,
            SettingName
        ]
        of Settings
    ) {
        const Button =
            document.getElementById(
                ButtonId
            );

        Button?.addEventListener(
            "click",
            () => {
                ToggleProfilePrivacySetting(
                    SettingName,
                    Button
                );
            }
        );
    }
}


function RenderProfilePrivacySettings() {
    const Settings =
        GetGardenerSettings();

    const Buttons = [
        [
            "ToggleGardenPreviewsButton",
            "Garden previews",
            "AllowGardenPreviews"
        ],
        [
            "ToggleCommentsButton",
            "Comments",
            "AllowComments"
        ],
        [
            "ToggleDewDonationsButton",
            "Dew donations",
            "AllowDewDonations"
        ],
        [
            "ToggleProfileStatsButton",
            "Statistics",
            "ShowStats"
        ]
    ];

    for (
        const [
            ButtonId,
            Label,
            SettingName
        ]
        of Buttons
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
            Settings[SettingName] !==
                false
        );
    }
}


async function ToggleProfilePrivacySetting(
    SettingName,
    Button
) {
    const Message =
        document.getElementById(
            "ProfilePrivacyMessage"
        );

    const Settings =
        GetGardenerSettings();

    const NewValue =
        Settings[SettingName] ===
            false;

    Button.disabled = true;

    if (Message !== null) {
        Message.textContent =
            "Saving...";
    }

    try {
        const Result =
            await SetUserConfig({
                Settings: {
                    [SettingName]:
                        NewValue
                }
            });

        if (!Result.Success) {
            if (Message !== null) {
                Message.textContent =
                    Result.Error ??
                    "Couldn't save profile privacy settings.";
            }

            return;
        }

        ProfileData ??= {};
        ProfileData.Settings =
            Result.Settings ?? {
                ...Settings,
                [SettingName]: NewValue
            };

        RenderProfilePrivacySettings();

        if (Message !== null) {
            Message.textContent =
                "Privacy setting saved.";
        }
    } catch (Error) {
        console.error(
            "Couldn't save profile privacy setting:",
            Error
        );

        if (Message !== null) {
            Message.textContent =
                "Couldn't save profile privacy settings.";
        }
    } finally {
        Button.disabled = false;
    }
}


function InitialiseProfilePictureChooser() {
    const SearchInput =
        document.getElementById(
            "ProfilePictureSearchInput"
        );

    const SortSelect =
        document.getElementById(
            "ProfilePictureSortSelect"
        );

    const GrowthStageSelect =
        document.getElementById(
            "ProfilePictureGrowthStageSelect"
        );

    const SaveButton =
        document.getElementById(
            "SaveProfilePictureButton"
        );


    if (SearchInput !== null) {
        SearchInput.value =
            ProfilePictureSearchQuery;

        SearchInput.addEventListener(
            "input",
            () => {
                ProfilePictureSearchQuery =
                    SearchInput.value;

                RenderProfilePictureGrid();
            }
        );
    }

    if (SortSelect !== null) {
        SortSelect.value =
            ProfilePictureSortMode;

        SortSelect.addEventListener(
            "change",
            () => {
                ProfilePictureSortMode =
                    SortSelect.value;

                RenderProfilePictureGrid();
            }
        );
    }

    GrowthStageSelect?.addEventListener(
        "change",
        () => {
            const GrowthStage =
                Number(
                    GrowthStageSelect.value
                );

            if (
                Number.isInteger(
                    GrowthStage
                ) &&
                GrowthStage > 0
            ) {
                ProfilePictureSelectedGrowthStage =
                    GrowthStage;

                RenderProfilePictureGrid();
            }
        }
    );

    SaveButton?.addEventListener(
        "click",
        SaveProfilePicture
    );


    const SavedProfilePicture =
        ProfileData?.ProfilePicture;

    if (
        SavedProfilePicture !== null &&
        typeof SavedProfilePicture ===
            "object" &&
        !Array.isArray(
            SavedProfilePicture
        ) &&
        typeof SavedProfilePicture.PlantKey ===
            "string" &&
        IsProfilePicturePlantAvailable(
            SavedProfilePicture.PlantKey
        )
    ) {
        ProfilePictureSelectedPlantKey =
            SavedProfilePicture.PlantKey;

        ProfilePictureSelectedGrowthStage =
            Number(
                SavedProfilePicture.GrowthStage
            );
    } else {
        const DefaultPlantKey =
            DefaultGardenerProfilePicture
                .PlantKey;

        const FirstEntry =
            GetProfilePicturePlantEntries()
                .sort(
                    (A, B) =>
                        A.Plant.Id -
                        B.Plant.Id
                )[0] ?? null;

        ProfilePictureSelectedPlantKey =
            IsProfilePicturePlantAvailable(
                DefaultPlantKey
            )
                ? DefaultPlantKey
                : FirstEntry?.PlantKey ??
                    null;

        ProfilePictureSelectedGrowthStage =
            ProfilePictureSelectedPlantKey ===
                DefaultPlantKey
                ? DefaultGardenerProfilePicture
                    .GrowthStage
                : null;
    }

    RenderProfilePictureChooser();
}


function GetProfilePicturePlantEntries() {
    if (ProfileSave === null) {
        return [];
    }

    return Object.entries(
        Plants
    )
        .filter(
            ([, Plant]) =>
                HasDiscoveredPlant(
                    ProfileSave,
                    Plant.Id
                )
        )
        .map(
            ([PlantKey, Plant]) => ({
                PlantKey: PlantKey,
                Plant: Plant
            })
        );
}


function IsProfilePicturePlantAvailable(
    PlantKey
) {
    const Plant =
        Plants[PlantKey];

    return (
        Plant !== undefined &&
        ProfileSave !== null &&
        HasDiscoveredPlant(
            ProfileSave,
            Plant.Id
        )
    );
}


function GetProfilePictureAvailableStages(
    Plant
) {
    return GetPlantImageSources(
        Plant
    )
        .map(
            (Source, Index) => ({
                Stage: Index + 1,
                Source: Source
            })
        )
        .filter(
            Item =>
                typeof Item.Source ===
                    "string" &&
                Item.Source.length > 0
        );
}


function GetProfilePictureMatureStage(
    Plant
) {
    const Stages =
        GetProfilePictureAvailableStages(
            Plant
        );

    return Stages.length === 0
        ? null
        : Stages[
            Stages.length - 1
        ].Stage;
}


function GetProfilePictureStageSource(
    Plant,
    GrowthStage
) {
    const Stages =
        GetProfilePictureAvailableStages(
            Plant
        );

    const RequestedStage =
        Stages.find(
            Item =>
                Item.Stage ===
                    GrowthStage
        );

    if (RequestedStage !== undefined) {
        return RequestedStage.Source;
    }

    return Stages.length === 0
        ? null
        : Stages[
            Stages.length - 1
        ].Source;
}


function RenderProfilePictureChooser() {
    RenderProfilePictureSelection();
    RenderProfilePictureGrid();
}


function RenderProfilePictureSelection() {
    const Name =
        document.getElementById(
            "ProfilePictureSelectedName"
        );

    const GrowthStageSelect =
        document.getElementById(
            "ProfilePictureGrowthStageSelect"
        );

    const SaveButton =
        document.getElementById(
            "SaveProfilePictureButton"
        );

    if (
        Name === null ||
        GrowthStageSelect === null ||
        SaveButton === null
    ) {
        return;
    }

    const Plant =
        ProfilePictureSelectedPlantKey ===
            null
            ? null
            : Plants[
                ProfilePictureSelectedPlantKey
            ] ?? null;

    GrowthStageSelect.replaceChildren();

    if (Plant === null) {
        Name.textContent =
            "None";

        const Option =
            document.createElement(
                "option"
            );

        Option.value = "";
        Option.textContent = "None";

        GrowthStageSelect.appendChild(
            Option
        );

        GrowthStageSelect.disabled = true;
        SaveButton.disabled = true;

        return;
    }

    Name.textContent =
        Plant.Name;

    const Stages =
        GetProfilePictureAvailableStages(
            Plant
        );

    if (Stages.length === 0) {
        const Option =
            document.createElement(
                "option"
            );

        Option.value = "";
        Option.textContent =
            "No image";

        GrowthStageSelect.appendChild(
            Option
        );

        GrowthStageSelect.disabled = true;
        SaveButton.disabled = true;

        return;
    }

    const ValidSelectedStage =
        Stages.some(
            Item =>
                Item.Stage ===
                    ProfilePictureSelectedGrowthStage
        );

    if (!ValidSelectedStage) {
        ProfilePictureSelectedGrowthStage =
            Stages[
                Stages.length - 1
            ].Stage;
    }

    for (
        let Index = 0;
        Index < Stages.length;
        Index++
    ) {
        const Stage =
            Stages[Index];

        const Option =
            document.createElement(
                "option"
            );

        Option.value =
            String(
                Stage.Stage
            );

        Option.textContent =
            Index === Stages.length - 1
                ? "Mature"
                : "Stage " +
                    Stage.Stage;

        GrowthStageSelect.appendChild(
            Option
        );
    }

    GrowthStageSelect.value =
        String(
            ProfilePictureSelectedGrowthStage
        );

    GrowthStageSelect.disabled = false;
    SaveButton.disabled = false;
}


function RenderProfilePictureGrid() {
    const Grid =
        document.getElementById(
            "ProfilePictureGrid"
        );

    if (Grid === null) {
        return;
    }

    Grid.replaceChildren();

    const Entries =
        GetProfilePicturePlantEntries();

    const SearchQuery =
        ProfilePictureSearchQuery
            .trim()
            .toLocaleLowerCase();

    const VisibleEntries =
        Entries
            .filter(
                Entry =>
                    DoesPlantCatalogueMatchSearch(
                        Entry.Plant,
                        SearchQuery,
                        ProfileSave
                    )
            )
            .sort(
                (A, B) =>
                    ComparePlantCataloguePlants(
                        A.Plant,
                        B.Plant,
                        ProfilePictureSortMode,
                        ProfileSave
                    )
            );

    if (Entries.length === 0) {
        SetProfilePictureCatalogueMessage(
            "No plants discovered yet."
        );

        return;
    }

    if (VisibleEntries.length === 0) {
        SetProfilePictureCatalogueMessage(
            "No discovered plants match your search."
        );

        return;
    }

    for (
        const Entry
        of VisibleEntries
    ) {
        Grid.appendChild(
            CreateProfilePictureOption(
                Entry
            )
        );
    }

    if (SearchQuery.length > 0) {
        SetProfilePictureCatalogueMessage(
            "Showing " +
            VisibleEntries.length
                .toLocaleString() +
            " of " +
            Entries.length
                .toLocaleString() +
            " discovered plants."
        );

        return;
    }

    SetProfilePictureCatalogueMessage(
        Entries.length === 1
            ? "1 plant available."
            : Entries.length
                .toLocaleString() +
                " plants available."
    );
}


function CreateProfilePictureOption(
    Entry
) {
    const Button =
        document.createElement(
            "button"
        );

    Button.type = "button";
    Button.className =
        "ProfilePictureOption";

    Button.setAttribute(
        "aria-pressed",
        Entry.PlantKey ===
            ProfilePictureSelectedPlantKey
            ? "true"
            : "false"
    );


    const Name =
        document.createElement(
            "span"
        );

    Name.className =
        "ProfilePictureOptionName";

    Name.textContent =
        Entry.Plant.Name;


    const Visual =
        document.createElement(
            "span"
        );

    Visual.className =
        "PlantTile ProfilePictureOptionVisual";


    const ImageSource =
        GetProfilePictureStageSource(
            Entry.Plant,
            ProfilePictureSelectedGrowthStage
        );

    if (ImageSource === null) {
        const Missing =
            document.createElement(
                "span"
            );

        Missing.className =
            "ProfilePictureOptionMissing";

        Missing.textContent =
            "No image";

        Visual.appendChild(
            Missing
        );
    } else {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite";

        Image.src =
            ImageSource;

        Image.alt =
            Entry.Plant.Name;

        Visual.appendChild(
            Image
        );
    }


    Button.append(
        Name,
        Visual
    );

    Button.addEventListener(
        "click",
        () => {
            ProfilePictureSelectedPlantKey =
                Entry.PlantKey;

            const AvailableStages =
                GetProfilePictureAvailableStages(
                    Entry.Plant
                );

            if (
                !AvailableStages.some(
                    Item =>
                        Item.Stage ===
                            ProfilePictureSelectedGrowthStage
                )
            ) {
                ProfilePictureSelectedGrowthStage =
                    GetProfilePictureMatureStage(
                        Entry.Plant
                    );
            }

            RenderProfilePictureChooser();
        }
    );


    return Button;
}


function SetProfilePictureCatalogueMessage(
    Text
) {
    const Message =
        document.getElementById(
            "ProfilePictureCatalogueMessage"
        );

    if (Message !== null) {
        Message.textContent =
            Text;
    }
}


async function SaveProfilePicture() {
    const Message =
        document.getElementById(
            "ProfilePictureMessage"
        );

    const SaveButton =
        document.getElementById(
            "SaveProfilePictureButton"
        );

    if (
        ProfilePictureSelectedPlantKey ===
            null ||
        !Number.isInteger(
            ProfilePictureSelectedGrowthStage
        ) ||
        ProfilePictureSelectedGrowthStage < 1
    ) {
        if (Message !== null) {
            Message.textContent =
                "Choose a plant with an image first.";
        }

        return;
    }

    if (SaveButton !== null) {
        SaveButton.disabled = true;
    }

    if (Message !== null) {
        Message.textContent =
            "Saving...";
    }

    try {
        const Result =
            await SetUserConfig({
                ProfilePicture: {
                    PlantKey:
                        ProfilePictureSelectedPlantKey,
                    GrowthStage:
                        ProfilePictureSelectedGrowthStage
                }
            });

        if (!Result.Success) {
            if (Message !== null) {
                Message.textContent =
                    Result.Error ??
                    "Couldn't save profile picture.";
            }

            return;
        }

        ProfileData ??= {};
        ProfileData.ProfilePicture =
            Result.ProfilePicture;

        if (Message !== null) {
            Message.textContent =
                "Profile picture saved.";
        }
    } catch (Error) {
        console.error(
            "Couldn't save profile picture:",
            Error
        );

        if (Message !== null) {
            Message.textContent =
                "Couldn't save profile picture.";
        }
    } finally {
        if (SaveButton !== null) {
            SaveButton.disabled = false;
        }
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

    const GardensOwned =
        ProfileSave
            ?.Gardens
            ?.length ??
        1;

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
        "ProfileGardensOwned",
        FormatProfileNumber(
            GardensOwned
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
        "ProfileGardensOwned",
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
