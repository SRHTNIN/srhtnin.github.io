let ProfileSave = null;


async function StartProfile() {
    await RenderProfileUsername();

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
}


async function RenderProfileUsername() {
    const Input =
        document.getElementById(
            "ProfileUsernameInput"
        );

    const Message =
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
            Input.value =
                Profile.Username;
        }

        Message.textContent = "";
    } catch (Error) {
        console.error(
            "Couldn't load username:",
            Error
        );

        Message.textContent =
            "Couldn't load username.";
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
