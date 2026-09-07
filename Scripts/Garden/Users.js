const DefaultColourPickerValue = "#000000";


function RenderGardenOwnerHeading(
    Username
) {
    const Heading =
        document.getElementById(
            "GardenPageHeading"
        );

    if (Heading === null) {
        return;
    }

    Heading.textContent =
        Username === null
            ? "Your Garden"
            : Username + "'s Garden";
}


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


function GetRelativeLuminance(
    Colour
) {
    const Channels = [
        Colour.slice(1, 3),
        Colour.slice(3, 5),
        Colour.slice(5, 7)
    ].map(
        Channel => {
            const Value =
                parseInt(
                    Channel,
                    16
                ) / 255;

            return Value <= 0.04045
                ? Value / 12.92
                : Math.pow(
                    (Value + 0.055) /
                    1.055,
                    2.4
                );
        }
    );

    return (
        0.2126 * Channels[0] +
        0.7152 * Channels[1] +
        0.0722 * Channels[2]
    );
}


function GetContrastRatio(
    FirstLuminance,
    SecondLuminance
) {
    const Lighter = Math.max(
        FirstLuminance,
        SecondLuminance
    );

    const Darker = Math.min(
        FirstLuminance,
        SecondLuminance
    );

    return (
        Lighter + 0.05
    ) / (
        Darker + 0.05
    );
}


function GetPlayerColourOutline(
    Colour
) {
    const ColourLuminance =
        GetRelativeLuminance(
            Colour
        );

    const LightLuminance =
        GetRelativeLuminance(
            "#cdd6f4"
        );

    const DarkLuminance =
        GetRelativeLuminance(
            "#11111b"
        );

    const LightContrast =
        GetContrastRatio(
            ColourLuminance,
            LightLuminance
        );

    const DarkContrast =
        GetContrastRatio(
            ColourLuminance,
            DarkLuminance
        );


    if (
        DarkContrast >=
        LightContrast
    ) {
        return null;
    }


    return "var(--Text)";
}


function GetPlayerColourShadow(
    Outline
) {
    const Shadows = [];

    for (let Y = -2; Y <= 2; Y++) {
        for (let X = -2; X <= 2; X++) {
            if (X === 0 && Y === 0) {
                continue;
            }

            Shadows.push(
                `${X}px ${Y}px 0 ${Outline}`
            );
        }
    }

    return Shadows.join(
        ", "
    );
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


    if (Outline !== null) {
        Element.style.textShadow =
            GetPlayerColourShadow(
                Outline
            );
    }
}


function GetGardenerProfilePictureSource(
    ProfilePicture
) {
    if (
        ProfilePicture === null ||
        typeof ProfilePicture !== "object" ||
        Array.isArray(ProfilePicture) ||
        typeof ProfilePicture.PlantKey !==
            "string" ||
        !Number.isInteger(
            Number(
                ProfilePicture.GrowthStage
            )
        )
    ) {
        return null;
    }

    if (
        typeof Plants === "undefined" ||
        typeof GetPlantImageSources !==
            "function"
    ) {
        return null;
    }

    const Plant =
        Plants[
            ProfilePicture.PlantKey
        ];

    if (Plant === undefined) {
        return null;
    }

    const Images =
        GetPlantImageSources(
            Plant
        );

    const GrowthStage = Number(
        ProfilePicture.GrowthStage
    );

    const RequestedSource =
        Images[GrowthStage - 1];

    if (
        typeof RequestedSource ===
            "string" &&
        RequestedSource.length > 0
    ) {
        return RequestedSource;
    }

    for (
        let Index = Images.length - 1;
        Index >= 0;
        Index--
    ) {
        if (
            typeof Images[Index] ===
                "string" &&
            Images[Index].length > 0
        ) {
            return Images[Index];
        }
    }

    return null;
}


function CreateGardenerAvatar(
    ProfilePicture,
    Username = "",
    AdditionalClass = null
) {
    const Avatar =
        document.createElement(
            "span"
        );

    Avatar.className =
        "PlantTile GardenerAvatar";

    if (
        typeof AdditionalClass ===
            "string" &&
        AdditionalClass.length > 0
    ) {
        Avatar.classList.add(
            AdditionalClass
        );
    }

    if (Username.length > 0) {
        Avatar.title =
            Username +
            "'s profile picture";
    }

    const ImageSource =
        GetGardenerProfilePictureSource(
            ProfilePicture
        );

    if (ImageSource !== null) {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite";

        Image.src = ImageSource;
        Image.alt = "";
        Image.draggable = false;

        Avatar.appendChild(
            Image
        );

        return Avatar;
    }

    const Placeholder =
        document.createElement(
            "span"
        );

    Placeholder.className =
        "GardenerAvatarPlaceholder";

    Placeholder.textContent = "□";

    Avatar.appendChild(
        Placeholder
    );

    return Avatar;
}


function GetGardenerPageUrl(
    Username
) {
    const Query =
        new URLSearchParams({
            Username: Username
        });

    return (
        "/Pages/Gardener.html?" +
        Query.toString()
    );
}


function CreateGardenerIdentity(
    Username,
    Colour,
    ProfilePicture,
    LinkToGardener = true
) {
    const Container =
        document.createElement(
            LinkToGardener
                ? "a"
                : "span"
        );

    Container.className =
        "GardenerIdentity";

    if (LinkToGardener) {
        Container.href =
            GetGardenerPageUrl(
                Username
            );
    }

    const Avatar =
        CreateGardenerAvatar(
            ProfilePicture,
            Username
        );

    const Name =
        document.createElement(
            "span"
        );

    Name.className =
        "GardenerIdentityName";

    Name.textContent = Username;

    ApplyPlayerColour(
        Name,
        Colour
    );

    Container.append(
        Avatar,
        Name
    );

    return Container;
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

async function SetUserConfig(
    Changes
) {
    const Response = await fetch(
        ApiUrl + "/SetUserConfig.php",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                SaveKey: GetSaveKey(),
                ...Changes
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

        RenderGardenOwnerHeading(
            Profile.Username
        );

        return;
    }

    UsernameDisplay.textContent =
        "Unnamed";

    ApplyPlayerColour(
        UsernameDisplay,
        null
    );

    UsernameForm.hidden = false;

    RenderGardenOwnerHeading(
        null
    );
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
