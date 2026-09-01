const AdminApiUrl =
    "https://api.srhtnin.garden";

const AdminSaveKeyName =
    "SarahtoninGardenSaveKey";


function GetStoredAdminSaveKey() {
    const SaveKey =
        localStorage.getItem(
            AdminSaveKeyName
        );

    if (
        typeof SaveKey !== "string" ||
        !/^[0-9A-Fa-f]{64}$/.test(
            SaveKey
        )
    ) {
        return null;
    }

    return SaveKey;
}


async function GetAdminStatus() {
    const SaveKey =
        GetStoredAdminSaveKey();

    if (SaveKey === null) {
        return {
            Success: true,
            IsAdmin: false
        };
    }

    const Response = await fetch(
        AdminApiUrl +
        "/AdminStatus.php",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                SaveKey: SaveKey
            })
        }
    );

    const Result =
        await Response.json();

    if (!Response.ok) {
        throw new Error(
            Result.Error ??
            "Couldn't verify admin access."
        );
    }

    return Result;
}


async function RenderAdminAccess() {
    const NavbarLink =
        document.getElementById(
            "AdminNavbarLink"
        );

    const AdminContent =
        document.getElementById(
            "AdminContent"
        );

    const AdminMessage =
        document.getElementById(
            "AdminAccessMessage"
        );


    try {
        const Status =
            await GetAdminStatus();

        const IsAdmin =
            Status.Success === true &&
            Status.IsAdmin === true;


        if (IsAdmin) {
            if (NavbarLink !== null) {
                NavbarLink.hidden = false;
            }

            if (AdminContent !== null) {
                AdminContent.hidden = false;
            }

            if (AdminMessage !== null) {
                AdminMessage.hidden = true;
            }

            return;
        }


        if (AdminMessage !== null) {
            AdminMessage.textContent =
                "Admin access required.";
        }
    } catch (Error) {
        console.error(
            "Couldn't verify admin access:",
            Error
        );

        if (AdminMessage !== null) {
            AdminMessage.textContent =
                "Couldn't verify admin access.";
        }
    }
}


document.addEventListener(
    "DOMContentLoaded",
    RenderAdminAccess
);
