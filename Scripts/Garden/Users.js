const DefaultPlayerColour = "#cdd6f4";


function IsValidPlayerColour(
    Colour
) {
    return (
        typeof Colour === "string" &&
        /^#[0-9A-Fa-f]{6}$/.test(
            Colour
        )
    );
}


function GetPlayerColourOutline(
    Colour
) {
    const Red = parseInt(
        Colour.slice(1, 3),
        16
    );

    const Green = parseInt(
        Colour.slice(3, 5),
        16
    );

    const Blue = parseInt(
        Colour.slice(5, 7),
        16
    );

    const Brightness =
        (
            Red * 299 +
            Green * 587 +
            Blue * 114
        ) / 1000;

    return Brightness < 150
        ? "var(--Text)"
        : "var(--Crust)";
}


function ApplyPlayerColour(
    Element,
    Colour
) {
    Element.style.removeProperty(
        "color"
    );

    Element.style.removeProperty(
        "text-shadow"
    );

    if (
        !IsValidPlayerColour(
            Colour
        )
    ) {
        return;
    }

    const Outline =
        GetPlayerColourOutline(
            Colour
        );

    Element.style.color =
        Colour;

    Element.style.textShadow =
        `-1px -1px 0 ${Outline}, ` +
        `0 -1px 0 ${Outline}, ` +
        `1px -1px 0 ${Outline}, ` +
        `-1px 0 0 ${Outline}, ` +
        `1px 0 0 ${Outline}, ` +
        `-1px 1px 0 ${Outline}, ` +
        `0 1px 0 ${Outline}, ` +
        `1px 1px 0 ${Outline}`;
}


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

async function SetColour(
    Colour
) {
    const Response =
        await fetch(
            ApiUrl +
            "/SetColour.php",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    SaveKey:
                        GetSaveKey(),

                    Colour:
                        Colour
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

        ApplyPlayerColour(
            UsernameDisplay,
            Profile.Colour
        );

        UsernameForm.hidden = true;

        return;
    }

    UsernameDisplay.textContent =
        "Unnamed";

    ApplyPlayerColour(
        UsernameDisplay,
        null
    );

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
