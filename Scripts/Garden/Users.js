async function GetProfile() {
    const Response = await fetch(
        ApiUrl + "/Profile.php",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                SaveKey: GetSaveKey()
            })
        }
    );

    return await Response.json();
}


async function SetUsername(
    Username
) {
    const Response = await fetch(
        ApiUrl + "/SetUsername.php",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                SaveKey: GetSaveKey(),
                Username: Username
            })
        }
    );

    return await Response.json();
}


async function RenderUser() {
    const Profile =
        await GetProfile();

    const UsernameDisplay =
        document.getElementById(
            "UsernameDisplay"
        );

    const UsernameForm =
        document.getElementById(
            "UsernameForm"
        );

    if (
        Profile.Success &&
        Profile.Username !== null
    ) {
        UsernameDisplay.textContent =
            Profile.Username;

        UsernameForm.hidden = true;

        return;
    }

    UsernameDisplay.textContent =
        "Unnamed";

    UsernameForm.hidden = false;
}


async function SubmitUsername(
    Event
) {
    Event.preventDefault();

    const Input =
        document.getElementById(
            "UsernameInput"
        );

    const Message =
        document.getElementById(
            "UsernameMessage"
        );

    const Result =
        await SetUsername(
            Input.value
        );

    if (!Result.Success) {
        Message.textContent =
            Result.Error;

        return;
    }

    Message.textContent =
        "Username set.";

    await RenderUser();
    await RenderLeaderboard();
}


document.addEventListener(
    "DOMContentLoaded",
    () => {
        const UsernameForm =
            document.getElementById(
                "UsernameForm"
            );

        if (UsernameForm !== null) {
            UsernameForm.addEventListener(
                "submit",
                SubmitUsername
            );
        }
    }
);
