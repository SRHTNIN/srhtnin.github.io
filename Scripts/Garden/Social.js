async function StartSocial() {
    let CurrentUsername = null;

    try {
        const Profile = await GetProfile();

        if (
            Profile.Success &&
            Profile.Username !== null
        ) {
            CurrentUsername =
                Profile.Username;
        }
    } catch (Error) {
        console.error(
            "Couldn't load current profile:",
            Error
        );
    }

    await RenderLeaderboard(
        CurrentUsername
    );
}


document.addEventListener(
    "DOMContentLoaded",
    StartSocial
);
