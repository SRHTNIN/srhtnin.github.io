let GardenerData = null;
let GardenerViewerProfile = null;
let GardenerGardenIndex = 0;
let GardenerCommentOffset = 0;
const GardenerCommentPageSize = 20;


async function StartGardener() {
    const Query =
        new URLSearchParams(
            window.location.search
        );

    const Username =
        Query.get("Username")?.trim() ?? "";

    if (Username.length === 0) {
        SetGardenerPageError(
            "No gardener was selected."
        );

        return;
    }

    BindGardenerControls();

    try {
        await LoadGameContent();
    } catch (Error) {
        console.error(
            "Couldn't load Garden content for gardener profile:",
            Error
        );
    }

    try {
        const [Gardener, ViewerProfile] =
            await Promise.all([
                FetchGardener(
                    Username
                ),
                GetProfile().catch(
                    () => null
                )
            ]);

        if (!Gardener.Success) {
            throw new Error(
                Gardener.Error ??
                "Couldn't load gardener."
            );
        }

        if (!Gardener.Exists) {
            SetGardenerPageError(
                "That gardener does not exist."
            );

            return;
        }

        GardenerData = Gardener;
        GardenerViewerProfile =
            ViewerProfile?.Success &&
            ViewerProfile.Exists
                ? ViewerProfile
                : null;

        GardenerGardenIndex =
            Number.isInteger(
                Number(
                    Gardener.ActiveGardenIndex
                )
            )
                ? Number(
                    Gardener.ActiveGardenIndex
                )
                : 0;

        RenderGardener();

        if (
            Gardener.Permissions?.Comments !==
                false
        ) {
            await LoadGardenerComments(
                true
            );
        }
    } catch (Error) {
        console.error(
            "Couldn't load gardener:",
            Error
        );

        SetGardenerPageError(
            "Couldn't load gardener."
        );
    }
}


function BindGardenerControls() {
    document.getElementById(
        "PreviousGardenerGardenButton"
    )?.addEventListener(
        "click",
        () => ChangeGardenerGarden(-1)
    );

    document.getElementById(
        "NextGardenerGardenButton"
    )?.addEventListener(
        "click",
        () => ChangeGardenerGarden(1)
    );

    document.getElementById(
        "GardenerDonationForm"
    )?.addEventListener(
        "submit",
        SubmitGardenerDonation
    );

    document.getElementById(
        "GardenerCommentForm"
    )?.addEventListener(
        "submit",
        SubmitGardenerComment
    );

    document.getElementById(
        "LoadMoreGardenerCommentsButton"
    )?.addEventListener(
        "click",
        () => LoadGardenerComments(false)
    );
}


async function FetchGardener(
    Username
) {
    const Response = await fetch(
        ApiUrl + "/Gardener.php",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                SaveKey: GetSaveKey(),
                Username: Username
            })
        }
    );

    return await Response.json();
}


function RenderGardener() {
    RenderGardenerHeader();
    RenderGardenerStatistics();
    RenderGardenerGardens();
    RenderGardenerDonation();
    RenderGardenerCommentsAvailability();

    const Message =
        document.getElementById(
            "GardenerPageMessage"
        );

    if (Message !== null) {
        Message.hidden = true;
    }
}


function RenderGardenerHeader() {
    const AvatarContainer =
        document.getElementById(
            "GardenerAvatar"
        );

    const Name =
        document.getElementById(
            "GardenerName"
        );

    const Description =
        document.getElementById(
            "GardenerDescription"
        );

    if (
        AvatarContainer === null ||
        Name === null ||
        Description === null ||
        GardenerData === null
    ) {
        return;
    }

    AvatarContainer.replaceChildren(
        CreateGardenerAvatar(
            GardenerData.ProfilePicture,
            GardenerData.Username,
            "GardenerAvatarHero"
        )
    );

    Name.textContent =
        GardenerData.Username;

    ApplyPlayerColour(
        Name,
        GardenerData.Colour
    );

    Description.textContent =
        typeof GardenerData.Description ===
            "string" &&
        GardenerData.Description.length > 0
            ? GardenerData.Description
            : "No description.";
}


function RenderGardenerStatistics() {
    const Section =
        document.getElementById(
            "GardenerStatsSection"
        );

    if (
        Section === null ||
        GardenerData === null
    ) {
        return;
    }

    Section.hidden = false;

    const Stats = GardenerData.Stats;

    if (
        Stats === null ||
        typeof Stats !== "object"
    ) {
        Section.replaceChildren(
            CreateGardenerPrivateSection(
                "Statistics",
                "This gardener keeps their statistics private."
            )
        );

        return;
    }

    SetGardenerStatistic(
        "GardenerCurrentDew",
        Stats.CurrentDew
    );

    SetGardenerStatistic(
        "GardenerLifetimeDew",
        Stats.LifetimeDew
    );

    SetGardenerStatistic(
        "GardenerPlantsDiscovered",
        Stats.PlantsDiscovered
    );

    SetGardenerStatistic(
        "GardenerMutationsDiscovered",
        Stats.MutationsDiscovered
    );

    SetGardenerStatistic(
        "GardenerGardensOwned",
        Stats.GardensOwned
    );

    const GardenSize =
        Number(Stats.ActiveGardenWidth) +
        "×" +
        Number(Stats.ActiveGardenHeight);

    const GardenSizeElement =
        document.getElementById(
            "GardenerActiveGardenSize"
        );

    if (GardenSizeElement !== null) {
        GardenSizeElement.textContent =
            GardenSize;
    }
}


function SetGardenerStatistic(
    ElementId,
    Value
) {
    const Element =
        document.getElementById(
            ElementId
        );

    if (Element !== null) {
        Element.textContent =
            Number(Value ?? 0)
                .toLocaleString();
    }
}


function CreateGardenerPrivateSection(
    Title,
    Message
) {
    const Fragment =
        document.createDocumentFragment();

    const Heading =
        document.createElement(
            "h2"
        );

    Heading.className =
        "PanelHeader PanelHeaderInset";

    Heading.textContent = Title;

    const Text =
        document.createElement(
            "p"
        );

    Text.className =
        "ProfileMessage";

    Text.textContent = Message;

    Fragment.append(
        Heading,
        Text
    );

    return Fragment;
}


function RenderGardenerGardens() {
    const Section =
        document.getElementById(
            "GardenerGardensSection"
        );

    if (
        Section === null ||
        GardenerData === null
    ) {
        return;
    }

    Section.hidden = false;

    if (!Array.isArray(GardenerData.Gardens)) {
        Section.classList.add(
            "Panel"
        );

        Section.replaceChildren(
            CreateGardenerPrivateSection(
                "Gardens",
                "This gardener has disabled Garden previews."
            )
        );

        return;
    }

    Section.classList.remove(
        "Panel"
    );

    if (GardenerData.Gardens.length === 0) {
        const Message =
            document.getElementById(
                "GardenerGardensMessage"
            );

        if (Message !== null) {
            Message.textContent =
                "This gardener has no Gardens to preview.";
            Message.hidden = false;
        }

        document.getElementById(
            "GardenerGardenGrid"
        )?.replaceChildren();

        return;
    }

    GardenerGardenIndex = Math.max(
        0,
        Math.min(
            GardenerData.Gardens.length - 1,
            GardenerGardenIndex
        )
    );

    RenderCurrentGardenerGarden();
}


function ChangeGardenerGarden(
    Difference
) {
    if (
        !Array.isArray(
            GardenerData?.Gardens
        ) ||
        GardenerData.Gardens.length === 0
    ) {
        return;
    }

    const NextIndex = Math.max(
        0,
        Math.min(
            GardenerData.Gardens.length - 1,
            GardenerGardenIndex +
                Difference
        )
    );

    if (
        NextIndex ===
        GardenerGardenIndex
    ) {
        return;
    }

    GardenerGardenIndex =
        NextIndex;

    RenderCurrentGardenerGarden();
}


function RenderCurrentGardenerGarden() {
    const Gardens =
        GardenerData?.Gardens;

    if (
        !Array.isArray(Gardens) ||
        Gardens.length === 0
    ) {
        return;
    }

    const Garden =
        Gardens[GardenerGardenIndex];

    const Grid =
        document.getElementById(
            "GardenerGardenGrid"
        );

    const PlotsPanel =
        document.getElementById(
            "GardenerPlots"
        );

    const Message =
        document.getElementById(
            "GardenerGardensMessage"
        );

    if (
        Grid === null ||
        PlotsPanel === null
    ) {
        return;
    }

    RenderGardenSelectorView({
        Gardens,
        GardenIndex:
            GardenerGardenIndex,
        PreviousButton:
            document.getElementById(
                "PreviousGardenerGardenButton"
            ),
        NameInput:
            document.getElementById(
                "GardenerGardenName"
            ),
        NextButton:
            document.getElementById(
                "NextGardenerGardenButton"
            )
    });

    PlotsPanel.style.setProperty(
        "--GardenBorderColour",
        GetGardenBorderColour(
            GardenerGardenIndex
        )
    );

    Grid.style.setProperty(
        "--GardenWidth",
        Math.max(
            1,
            Number(Garden.Width) || 1
        )
    );

    Grid.replaceChildren();

    for (
        const Plot
        of Array.isArray(Garden.Plots)
            ? Garden.Plots
            : []
    ) {
        Grid.appendChild(
            CreateGardenerGardenPlot(
                Plot
            )
        );
    }

    if (Message !== null) {
        Message.textContent = "";
        Message.hidden = true;
    }
}


function CreateGardenerGardenPlot(
    Plot
) {
    const Plant =
        Plot === null ||
        typeof Plot !== "object"
            ? null
            : Plants[Plot.Plant];

    let Progress = 0;
    let ImagePath = null;
    let TimerText = "";

    const RenderTime =
        Date.now();

    if (
        Plot !== null &&
        typeof Plot === "object" &&
        Plant !== undefined
    ) {
        Progress =
            GetGardenPlotGrowthProgress(
                Plot,
                Plant,
                RenderTime
            );

        ImagePath =
            GetGardenPlotImage(
                Plot,
                Plant,
                Progress
            );

        TimerText =
            GetGardenPlotTimerText(
                Plot,
                Plant,
                Progress,
                RenderTime
            );
    }

    const View =
        CreateGardenPlotView({
            Plot:
                Plot !== null &&
                typeof Plot === "object"
                    ? Plot
                    : null,
            Plant,
            Progress,
            BorderProgress: Progress,
            DisplaySettings: {
                ShowPlantNames: true,
                ShowGrowthTimers: false,
                ShowPlotRotation: false
            },
            ImagePath,
            TimerText,
            ReadOnly: true,
            Mature:
                Plant !== null &&
                Plant !== undefined &&
                Progress >= 1
        });

    if (Plot === null) {
        View.MainButton.title =
            "Empty plot";
    } else if (
        Plant === null ||
        Plant === undefined
    ) {
        View.MainButton.title =
            "Unknown plant";
    } else {
        View.MainButton.title =
            Plant.Name +
            (Progress >= 1
                ? " — mature"
                : " — growing");
    }

    return View.Tile;
}


function RenderGardenerDonation() {
    const Section =
        document.getElementById(
            "GardenerDonationSection"
        );

    const Form =
        document.getElementById(
            "GardenerDonationForm"
        );

    const Message =
        document.getElementById(
            "GardenerDonationMessage"
        );

    if (
        Section === null ||
        Form === null ||
        Message === null ||
        GardenerData === null
    ) {
        return;
    }

    Section.hidden = false;

    if (
        GardenerData.Permissions
            ?.DewDonations === false
    ) {
        Form.hidden = true;
        SetGardenerDonationBalance(null);
        Message.textContent =
            "This gardener has disabled Dew donations.";
        return;
    }

    if (GardenerData.IsSelf === true) {
        Form.hidden = true;
        SetGardenerDonationBalance(
            GardenerViewerProfile?.CurrentDew ?? null
        );
        Message.textContent =
            "You cannot donate Dew to yourself.";
        return;
    }

    if (GardenerViewerProfile === null) {
        Form.hidden = true;
        SetGardenerDonationBalance(null);
        Message.textContent =
            "Create a Garden save before donating Dew.";
        return;
    }

    Form.hidden = false;
    Message.textContent = "";

    SetGardenerDonationBalance(
        GardenerViewerProfile.CurrentDew
    );
}


function SetGardenerDonationBalance(
    Dew
) {
    const Balance =
        document.getElementById(
            "GardenerDonationBalance"
        );

    if (Balance === null) {
        return;
    }

    if (!Number.isFinite(Number(Dew))) {
        Balance.textContent = "";
        return;
    }

    Balance.textContent =
        "You have " +
        Number(Dew).toLocaleString() +
        " Dew available.";
}


async function SubmitGardenerDonation(
    Event
) {
    Event.preventDefault();

    if (GardenerData === null) {
        return;
    }

    const Input =
        document.getElementById(
            "GardenerDonationAmount"
        );

    const Message =
        document.getElementById(
            "GardenerDonationMessage"
        );

    const Button =
        Event.currentTarget.querySelector(
            "button[type='submit']"
        );

    const Amount = Number(
        Input?.value
    );

    if (
        !Number.isInteger(Amount) ||
        Amount < 1
    ) {
        if (Message !== null) {
            Message.textContent =
                "Enter a positive whole number of Dew.";
        }

        return;
    }

    if (Button !== null) {
        Button.disabled = true;
    }

    if (Message !== null) {
        Message.textContent =
            "Donating...";
    }

    try {
        const Response = await fetch(
            ApiUrl + "/DonateDew.php",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    SaveKey: GetSaveKey(),
                    Username:
                        GardenerData.Username,
                    Amount: Amount
                })
            }
        );

        const Result =
            await Response.json();

        if (!Result.Success) {
            throw new Error(
                Result.Error ??
                "Couldn't donate Dew."
            );
        }

        if (
            Result.SaveData !== null &&
            typeof Result.SaveData ===
                "object"
        ) {
            WriteLocalSave(
                NormalizeSaveData(
                    Result.SaveData
                )
            );
        }

        if (GardenerViewerProfile !== null) {
            GardenerViewerProfile.CurrentDew =
                Number(Result.CurrentDew);
        }

        if (
            GardenerData.Stats !== null &&
            typeof GardenerData.Stats ===
                "object" &&
            Number.isFinite(
                Number(Result.TargetCurrentDew)
            )
        ) {
            GardenerData.Stats.CurrentDew =
                Number(
                    Result.TargetCurrentDew
                );

            RenderGardenerStatistics();
        }

        SetGardenerDonationBalance(
            Result.CurrentDew
        );

        if (Input !== null) {
            Input.value = "";
        }

        if (Message !== null) {
            Message.textContent =
                "Donated " +
                Amount.toLocaleString() +
                " Dew to " +
                GardenerData.Username +
                ".";
        }
    } catch (Error) {
        console.error(
            "Couldn't donate Dew:",
            Error
        );

        if (Message !== null) {
            Message.textContent =
                Error.message ??
                "Couldn't donate Dew.";
        }
    } finally {
        if (Button !== null) {
            Button.disabled = false;
        }
    }
}


function RenderGardenerCommentsAvailability() {
    const Section =
        document.getElementById(
            "GardenerCommentsSection"
        );

    const Form =
        document.getElementById(
            "GardenerCommentForm"
        );

    const Message =
        document.getElementById(
            "GardenerCommentMessage"
        );

    if (
        Section === null ||
        Form === null ||
        Message === null ||
        GardenerData === null
    ) {
        return;
    }

    Section.hidden = false;

    if (
        GardenerData.Permissions
            ?.Comments === false
    ) {
        Form.hidden = true;
        Message.textContent =
            "This gardener has disabled comments.";
        document.getElementById(
            "GardenerCommentList"
        )?.replaceChildren();
        return;
    }

    if (
        GardenerViewerProfile === null ||
        typeof GardenerViewerProfile.Username !==
            "string" ||
        GardenerViewerProfile.Username.length === 0
    ) {
        Form.hidden = true;
        Message.textContent =
            "Set a username before leaving comments.";
        return;
    }

    Form.hidden = false;
    Message.textContent = "";
}


async function LoadGardenerComments(
    Reset
) {
    if (GardenerData === null) {
        return;
    }

    const List =
        document.getElementById(
            "GardenerCommentList"
        );

    const LoadMoreButton =
        document.getElementById(
            "LoadMoreGardenerCommentsButton"
        );

    if (List === null) {
        return;
    }

    if (Reset) {
        GardenerCommentOffset = 0;
        List.replaceChildren();
    }

    if (LoadMoreButton !== null) {
        LoadMoreButton.disabled = true;
    }

    try {
        const Result =
            await GetGardenerComments(
                GardenerData.Username,
                GardenerCommentOffset,
                GardenerCommentPageSize
            );

        if (!Result.Success) {
            throw new Error(
                Result.Error ??
                "Couldn't load comments."
            );
        }

        if (!Result.Enabled) {
            RenderGardenerCommentsAvailability();
            return;
        }

        const Comments =
            Array.isArray(Result.Comments)
                ? Result.Comments
                : [];

        for (const Comment of Comments) {
            List.appendChild(
                CreateGardenerComment(
                    Comment
                )
            );
        }

        GardenerCommentOffset +=
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

        if (LoadMoreButton !== null) {
            LoadMoreButton.hidden =
                Result.HasMore !== true;
        }
    } catch (Error) {
        console.error(
            "Couldn't load gardener comments:",
            Error
        );

        const Message =
            document.getElementById(
                "GardenerCommentMessage"
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


function CreateGardenerComment(
    Comment
) {
    return CreateGardenerCommentCard(
        Comment,
        DeleteGardenerComment
    );
}


async function SubmitGardenerComment(
    Event
) {
    Event.preventDefault();

    if (GardenerData === null) {
        return;
    }

    const Input =
        document.getElementById(
            "GardenerCommentInput"
        );

    const Message =
        document.getElementById(
            "GardenerCommentMessage"
        );

    const Button =
        Event.currentTarget.querySelector(
            "button[type='submit']"
        );

    const Text =
        Input?.value.trim() ?? "";

    if (Text.length === 0) {
        if (Message !== null) {
            Message.textContent =
                "Comment cannot be empty.";
        }

        return;
    }

    if (Button !== null) {
        Button.disabled = true;
    }

    if (Message !== null) {
        Message.textContent =
            "Posting...";
    }

    try {
        const Response = await fetch(
            ApiUrl + "/Comments.php",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    Action: "Add",
                    SaveKey: GetSaveKey(),
                    Username:
                        GardenerData.Username,
                    Text: Text
                })
            }
        );

        const Result =
            await Response.json();

        if (!Result.Success) {
            throw new Error(
                Result.Error ??
                "Couldn't leave comment."
            );
        }

        if (Input !== null) {
            Input.value = "";
        }

        if (Message !== null) {
            Message.textContent =
                "Comment posted.";
        }

        await LoadGardenerComments(
            true
        );
    } catch (Error) {
        console.error(
            "Couldn't leave comment:",
            Error
        );

        if (Message !== null) {
            Message.textContent =
                Error.message ??
                "Couldn't leave comment.";
        }
    } finally {
        if (Button !== null) {
            Button.disabled = false;
        }
    }
}


async function DeleteGardenerComment(
    CommentId,
    Button
) {
    Button.disabled = true;

    const Message =
        document.getElementById(
            "GardenerCommentMessage"
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

        if (Message !== null) {
            Message.textContent =
                "Comment deleted.";
        }

        await LoadGardenerComments(
            true
        );
    } catch (Error) {
        console.error(
            "Couldn't delete comment:",
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


function SetGardenerPageError(
    Message
) {
    const PageMessage =
        document.getElementById(
            "GardenerPageMessage"
        );

    if (PageMessage !== null) {
        PageMessage.hidden = false;
        PageMessage.textContent =
            Message;
    }

    const Description =
        document.getElementById(
            "GardenerDescription"
        );

    if (Description !== null) {
        Description.textContent = "";
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartGardener
);
