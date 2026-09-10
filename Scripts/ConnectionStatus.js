const GardenApiHost = "api.srhtnin.garden";
let GardenConnectionMessageShown = false;

function ShowGardenConnectionMessage() {
    if (GardenConnectionMessageShown) {
        return;
    }

    const MainContainer =
        document.querySelector(".MainContainer");

    if (MainContainer === null) {
        return;
    }

    GardenConnectionMessageShown = true;

    const Message = document.createElement("p");
    Message.className = "PageMessage";
    Message.textContent =
        "Garden's server is currently unavailable. " +
        "Some features may not work until the connection is restored.";

    MainContainer.prepend(Message);
}

const OriginalFetch = window.fetch.bind(window);

window.fetch = async function(...Arguments) {
    const RequestUrl =
        typeof Arguments[0] === "string"
            ? Arguments[0]
            : Arguments[0]?.url;

    const IsGardenApiRequest =
        typeof RequestUrl === "string" &&
        new URL(
            RequestUrl,
            window.location.href
        ).hostname === GardenApiHost;

    try {
        const Response =
            await OriginalFetch(...Arguments);

        if (
            IsGardenApiRequest &&
            Response.status >= 500
        ) {
            ShowGardenConnectionMessage();
        }

        return Response;
    } catch (Error) {
        if (IsGardenApiRequest) {
            ShowGardenConnectionMessage();
        }

        throw Error;
    }
};
