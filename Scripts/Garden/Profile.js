let ProfileSave = null;


async function StartProfile() {
    await RenderProfilePlayer();

    try {
        ProfileSave =
            await LoadGame();

        RenderProfileStatistics();
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
                : DefaultPlayerColour;

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
            DefaultPlayerColour;

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
