const DefaultColourPickerValue = "#000000";

const DefaultGardenerProfilePicture = Object.freeze({
    PlantKey: "RedRose",
    GrowthStage: 3
});

let PlayerCommentUsername = null;
let PlayerCommentOffset = 0;
const PlayerCommentPageSize = 20;


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
    const Candidate =
        ProfilePicture !== null &&
        typeof ProfilePicture === "object" &&
        !Array.isArray(ProfilePicture) &&
        typeof ProfilePicture.PlantKey ===
            "string" &&
        Number.isInteger(
            Number(
                ProfilePicture.GrowthStage
            )
        )
            ? ProfilePicture
            : DefaultGardenerProfilePicture;

    if (
        typeof Plants === "undefined" ||
        typeof GetPlantImageSources !==
            "function"
    ) {
        return null;
    }

    let Plant =
        Plants[Candidate.PlantKey];

    let GrowthStage = Number(
        Candidate.GrowthStage
    );

    if (Plant === undefined) {
        Plant = Plants[
            DefaultGardenerProfilePicture
                .PlantKey
        ];

        GrowthStage =
            DefaultGardenerProfilePicture
                .GrowthStage;
    }

    if (Plant === undefined) {
        return null;
    }

    const Images =
        GetPlantImageSources(
            Plant
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

    if (
        Candidate !==
            DefaultGardenerProfilePicture
    ) {
        return GetGardenerProfilePictureSource(
            DefaultGardenerProfilePicture
        );
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


function CreateGardenerCommentCard(
    Comment,
    DeleteHandler = null
) {
    const Article =
        document.createElement(
            "article"
        );

    Article.className =
        "PlantTile GardenerComment";

    Article.dataset.commentId =
        String(Comment.Id);

    const Header =
        document.createElement(
            "div"
        );

    Header.className =
        "GardenerCommentHeader";

    const Identity =
        CreateGardenerIdentity(
            Comment.Username,
            Comment.Colour,
            Comment.ProfilePicture
        );

    const Time =
        document.createElement(
            "time"
        );

    Time.className =
        "GardenerCommentTime";

    const CreatedAt = Number(
        Comment.CreatedAt
    );

    if (Number.isFinite(CreatedAt)) {
        const DateValue =
            new Date(CreatedAt);

        Time.dateTime =
            DateValue.toISOString();

        Time.textContent =
            DateValue.toLocaleString();
    }

    Header.append(
        Identity,
        Time
    );

    const Text =
        document.createElement(
            "p"
        );

    Text.className =
        "GardenerCommentText";

    Text.textContent =
        Comment.Text ?? "";

    Article.append(
        Header,
        Text
    );

    if (
        Comment.CanDelete === true &&
        typeof DeleteHandler ===
            "function"
    ) {
        const DeleteButton =
            document.createElement(
                "button"
            );

        DeleteButton.type = "button";
        DeleteButton.className =
            "ActionButton GardenerCommentDelete";
        DeleteButton.textContent =
            "Delete";

        DeleteButton.addEventListener(
            "click",
            () => DeleteHandler(
                Number(Comment.Id),
                DeleteButton
            )
        );

        Article.appendChild(
            DeleteButton
        );
    }

    return Article;
}


async function GetGardenerComments(
    Username,
    Offset = 0,
    Limit = 20
) {
    const Response = await fetch(
        ApiUrl + "/Comments.php",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                Action: "List",
                SaveKey: GetSaveKey(),
                Username: Username,
                Offset: Offset,
                Limit: Limit
            })
        }
    );

    return await Response.json();
}


async function DeleteGardenerCommentRequest(
    CommentId
) {
    const Response = await fetch(
        ApiUrl + "/Comments.php",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                Action: "Delete",
                SaveKey: GetSaveKey(),
                CommentId: CommentId
            })
        }
    );

    return await Response.json();
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

    const PlayerIdentity =
        document.getElementById(
            "PlayerIdentity"
        );

    const UsernameForm =
        document.getElementById(
            "UsernameForm"
        );

    if (
        Profile.Success &&
        Profile.Username !== null
    ) {
        if (PlayerIdentity !== null) {
            const Identity =
                CreateGardenerIdentity(
                    Profile.Username,
                    Profile.Colour,
                    Profile.ProfilePicture,
                    false
                );

            Identity.classList.add(
                "GardenPlayerIdentityContent"
            );

            Identity.querySelector(
                ".GardenerAvatar"
            )?.classList.add(
                "GardenerAvatarLarge"
            );

            PlayerIdentity.replaceChildren(
                Identity
            );
        }

        UsernameForm.hidden = true;

        RenderGardenOwnerHeading(
            Profile.Username
        );

        await LoadPlayerComments(
            Profile.Username,
            true
        );

        return;
    }

    if (PlayerIdentity !== null) {
        const Identity =
            CreateGardenerIdentity(
                "Unnamed",
                null,
                null,
                false
            );

        Identity.classList.add(
            "GardenPlayerIdentityContent"
        );

        Identity.querySelector(
            ".GardenerAvatar"
        )?.classList.add(
            "GardenerAvatarLarge"
        );

        PlayerIdentity.replaceChildren(
            Identity
        );
    }

    UsernameForm.hidden = false;

    RenderGardenOwnerHeading(
        null
    );

    PlayerCommentUsername = null;
    PlayerCommentOffset = 0;

    const CommentList =
        document.getElementById(
            "PlayerCommentList"
        );

    const CommentMessage =
        document.getElementById(
            "PlayerCommentMessage"
        );

    const LoadMoreButton =
        document.getElementById(
            "LoadMorePlayerCommentsButton"
        );

    CommentList?.replaceChildren();

    if (CommentMessage !== null) {
        CommentMessage.textContent =
            "Set a username to receive comments.";
    }

    if (LoadMoreButton !== null) {
        LoadMoreButton.hidden = true;
    }
}


async function LoadPlayerComments(
    Username,
    Reset
) {
    const List =
        document.getElementById(
            "PlayerCommentList"
        );

    const Message =
        document.getElementById(
            "PlayerCommentMessage"
        );

    const LoadMoreButton =
        document.getElementById(
            "LoadMorePlayerCommentsButton"
        );

    if (List === null) {
        return;
    }

    if (Reset) {
        PlayerCommentUsername = Username;
        PlayerCommentOffset = 0;
        List.replaceChildren();
    }

    if (
        typeof PlayerCommentUsername !==
            "string" ||
        PlayerCommentUsername.length === 0
    ) {
        if (Message !== null) {
            Message.textContent =
                "Set a username to receive comments.";
        }

        if (LoadMoreButton !== null) {
            LoadMoreButton.hidden = true;
        }

        return;
    }

    if (LoadMoreButton !== null) {
        LoadMoreButton.disabled = true;
    }

    try {
        const Result =
            await GetGardenerComments(
                PlayerCommentUsername,
                PlayerCommentOffset,
                PlayerCommentPageSize
            );

        if (!Result.Success) {
            throw new Error(
                Result.Error ??
                "Couldn't load comments."
            );
        }

        const Comments =
            Array.isArray(Result.Comments)
                ? Result.Comments
                : [];

        for (const Comment of Comments) {
            List.appendChild(
                CreateGardenerCommentCard(
                    Comment,
                    DeletePlayerComment
                )
            );
        }

        PlayerCommentOffset +=
            Comments.length;

        if (
            Reset &&
            Comments.length === 0
        ) {
            const Empty =
                document.createElement(
                    "p"
                );

            Empty.className =
                "GardenerCommentsEmpty";

            Empty.textContent =
                "No comments yet.";

            List.appendChild(
                Empty
            );
        }

        if (Message !== null) {
            Message.textContent = "";
        }

        if (LoadMoreButton !== null) {
            LoadMoreButton.hidden =
                Result.HasMore !== true;
        }
    } catch (Error) {
        console.error(
            "Couldn't load player comments:",
            Error
        );

        if (Message !== null) {
            Message.textContent =
                "Couldn't load comments.";
        }
    } finally {
        if (LoadMoreButton !== null) {
            LoadMoreButton.disabled = false;
        }
    }
}


async function DeletePlayerComment(
    CommentId,
    Button
) {
    Button.disabled = true;

    const Message =
        document.getElementById(
            "PlayerCommentMessage"
        );

    try {
        const Result =
            await DeleteGardenerCommentRequest(
                CommentId
            );

        if (!Result.Success) {
            throw new Error(
                Result.Error ??
                "Couldn't delete comment."
            );
        }

        await LoadPlayerComments(
            PlayerCommentUsername,
            true
        );

        if (Message !== null) {
            Message.textContent =
                "Comment deleted.";
        }
    } catch (Error) {
        console.error(
            "Couldn't delete player comment:",
            Error
        );

        if (Message !== null) {
            Message.textContent =
                Error.message ??
                "Couldn't delete comment.";
        }

        Button.disabled = false;
    }
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

        document.getElementById(
            "LoadMorePlayerCommentsButton"
        )?.addEventListener(
            "click",
            () => LoadPlayerComments(
                PlayerCommentUsername,
                false
            )
        );
    }
);
