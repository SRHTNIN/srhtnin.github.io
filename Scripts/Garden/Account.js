function StartAccount() {
    const AccountKeySpoiler =
        document.querySelector(
            ".AccountKeySpoiler"
        );

    const CopyButton =
        document.getElementById(
            "CopyAccountKeyButton"
        );

    const ExportButton =
        document.getElementById(
            "ExportAccountKeyButton"
        );

    const ImportForm =
        document.getElementById(
            "ImportAccountForm"
        );

    const ImportFileButton =
        document.getElementById(
            "ImportAccountKeyFileButton"
        );

    const ImportFileInput =
        document.getElementById(
            "ImportAccountKeyFile"
        );


    AccountKeySpoiler.addEventListener(
        "toggle",
        RenderAccountKeySpoiler
    );

    CopyButton.addEventListener(
        "click",
        CopyAccountKey
    );

    ExportButton.addEventListener(
        "click",
        ExportAccountKey
    );

    ImportForm.addEventListener(
        "submit",
        SubmitAccountImport
    );

    ImportFileButton.addEventListener(
        "click",
        () => {
            ImportFileInput.click();
        }
    );

    ImportFileInput.addEventListener(
        "change",
        ImportAccountKeyFile
    );
}


function RenderAccountKeySpoiler() {
    const Spoiler =
        document.querySelector(
            ".AccountKeySpoiler"
        );

    const Summary =
        Spoiler.querySelector(
            "summary"
        );

    const Display =
        document.getElementById(
            "AccountKeyDisplay"
        );


    if (Spoiler.open) {
        Display.textContent =
            GetSaveKey();

        Summary.textContent =
            "Hide Account Key";

        return;
    }


    /*
     * Remove the key from the page when
     * the spoiler is closed again.
     */

    Display.textContent =
        "Hidden";

    Summary.textContent =
        "Show Account Key";
}


async function CopyAccountKey() {
    const AccountKey =
        GetSaveKey();

    const Message =
        document.getElementById(
            "AccountKeyMessage"
        );


    try {
        if (
            navigator.clipboard !==
            undefined
        ) {
            await navigator.clipboard.writeText(
                AccountKey
            );
        } else {
            CopyTextFallback(
                AccountKey
            );
        }

        Message.textContent =
            "Account Key copied.";
    } catch (Error) {
        console.error(
            "Couldn't copy Account Key:",
            Error
        );

        try {
            CopyTextFallback(
                AccountKey
            );

            Message.textContent =
                "Account Key copied.";
        } catch (FallbackError) {
            console.error(
                "Couldn't copy Account Key:",
                FallbackError
            );

            Message.textContent =
                "Couldn't copy Account Key.";
        }
    }
}


function CopyTextFallback(
    Text
) {
    const TextArea =
        document.createElement(
            "textarea"
        );

    TextArea.value =
        Text;

    TextArea.setAttribute(
        "readonly",
        ""
    );

    TextArea.style.position =
        "fixed";

    TextArea.style.opacity =
        "0";


    document.body.appendChild(
        TextArea
    );

    TextArea.select();


    const Success =
        document.execCommand(
            "copy"
        );


    TextArea.remove();


    if (!Success) {
        throw new Error(
            "Copy command failed."
        );
    }
}


function ExportAccountKey() {
    const AccountKey =
        GetSaveKey();

    const Message =
        document.getElementById(
            "AccountKeyMessage"
        );


    try {
        const File =
            new Blob(
                [
                    AccountKey +
                    "\n"
                ],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );

        const FileUrl =
            URL.createObjectURL(
                File
            );

        const Link =
            document.createElement(
                "a"
            );

        Link.href =
            FileUrl;

        Link.download =
            "SarahtoninGardenAccountKey.txt";


        document.body.appendChild(
            Link
        );

        Link.click();

        Link.remove();


        URL.revokeObjectURL(
            FileUrl
        );


        Message.textContent =
            "Account Key exported.";
    } catch (Error) {
        console.error(
            "Couldn't export Account Key:",
            Error
        );

        Message.textContent =
            "Couldn't export Account Key.";
    }
}


async function SubmitAccountImport(
    Event
) {
    Event.preventDefault();

    const Input =
        document.getElementById(
            "ImportAccountKeyInput"
        );

    await ImportAccountKey(
        Input.value
    );
}


async function ImportAccountKeyFile(
    Event
) {
    const File =
        Event.target.files[0];

    if (File === undefined) {
        return;
    }


    const Message =
        document.getElementById(
            "ImportAccountMessage"
        );


    try {
        const AccountKey =
            await File.text();

        const Input =
            document.getElementById(
                "ImportAccountKeyInput"
            );

        Input.value =
            AccountKey.trim();

        await ImportAccountKey(
            AccountKey
        );
    } catch (Error) {
        console.error(
            "Couldn't read Account Key file:",
            Error
        );

        Message.textContent =
            "Couldn't read that Account Key file.";
    } finally {
        /*
         * Allows the same file to be
         * selected again later.
         */

        Event.target.value =
            "";
    }
}


async function ImportAccountKey(
    RawAccountKey
) {
    const Message =
        document.getElementById(
            "ImportAccountMessage"
        );

    const AccountKey =
        NormalizeAccountKey(
            RawAccountKey
        );


    if (
        !IsValidAccountKey(
            AccountKey
        )
    ) {
        Message.textContent =
            "That isn't a valid Account Key.";

        return;
    }


    const CurrentAccountKey =
        GetSaveKey();


    if (
        AccountKey ===
        CurrentAccountKey
    ) {
        Message.textContent =
            "You're already using that account.";

        return;
    }


    Message.textContent =
        "Checking account...";


    /*
     * Check that the key actually belongs
     * to an existing Garden account before
     * replacing this browser's key.
     *
     * This prevents a typo from silently
     * creating a completely new account.
     */

    let AccountExists;

    try {
        AccountExists =
            await CheckAccountKeyExists(
                AccountKey
            );
    } catch (Error) {
        console.error(
            "Couldn't verify Account Key:",
            Error
        );

        Message.textContent =
            "Couldn't verify that account right now.";

        return;
    }


    if (!AccountExists) {
        Message.textContent =
            "No Garden account exists for that key.";

        return;
    }


    const Confirmed =
        window.confirm(
            "Import this Garden account?\n\n" +
            "This browser will stop using its current " +
            "account and switch to the imported one.\n\n" +
            "The current account and its server save " +
            "will not be deleted."
        );


    if (!Confirmed) {
        Message.textContent =
            "Import cancelled.";

        return;
    }


    /*
     * Try to synchronize the current
     * browser save one last time before
     * switching away from it.
     */

    const CurrentSave =
        ReadLocalSave();


    if (CurrentSave !== null) {
        Message.textContent =
            "Saving current account...";

        try {
            await WriteRemoteSave(
                CurrentSave
            );
        } catch (Error) {
            console.error(
                "Couldn't synchronize current account:",
                Error
            );

            const SwitchAnyway =
                window.confirm(
                    "The current account couldn't be " +
                    "synchronized with the server.\n\n" +
                    "Switch accounts anyway?"
                );


            if (!SwitchAnyway) {
                Message.textContent =
                    "Import cancelled.";

                return;
            }
        }
    }


    /*
     * Change identity first, then remove
     * the cached save.
     *
     * On reload, LoadGame() sees no local
     * save and downloads the imported
     * account's save from the server.
     */

    localStorage.setItem(
        SaveKeyName,
        AccountKey
    );

    localStorage.removeItem(
        LocalSaveName
    );


    Message.textContent =
        "Account imported. Reloading...";


    location.reload();
}


function NormalizeAccountKey(
    AccountKey
) {
    return AccountKey
        .trim()
        .toLowerCase();
}


function IsValidAccountKey(
    AccountKey
) {
    return /^[a-f0-9]{64}$/.test(
        AccountKey
    );
}


async function CheckAccountKeyExists(
    AccountKey
) {
    const Response =
        await fetch(
            ApiUrl + "/Load.php",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    SaveKey:
                        AccountKey
                })
            }
        );


    if (!Response.ok) {
        throw new Error(
            "Load API returned HTTP " +
            Response.status
        );
    }


    const Result =
        await Response.json();


    if (!Result.Success) {
        throw new Error(
            Result.Error ??
            "Account lookup failed."
        );
    }


    return (
        Result.Exists === true
    );
}


document.addEventListener(
    "DOMContentLoaded",
    StartAccount
);
