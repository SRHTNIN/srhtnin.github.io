const SaveKeyName = "SarahtoninGardenSaveKey";
const LocalSaveName = "SarahtoninGarden";

const ApiUrl = "https://api.srhtnin.garden";


function CreateNewSave() {
    return {
        Version: 1,
        Revision: 0,
        LastSavedAt: Date.now(),

        Currency: {
            Dew: 0
        },

        Statistics: {
            CurrencyEarned: {
                Dew: 0
            }
        },

        Seeds: {
            Unlocked: [
                "Rose"
            ]
        },

        Upgrades: {
            PlotSize: 0
        },

        Garden: {
            Width: 3,
            Height: 3,
            Plots: Array(9).fill(null)
        },

        Discoveries: {
            Plants: [
                "Rose"
            ],

            Mutations: []
        },

        MutationCooldowns: {}
    };
}


function GetSaveKey() {
    let SaveKey = localStorage.getItem(
        SaveKeyName
    );

    if (SaveKey !== null) {
        return SaveKey;
    }

    const Bytes = new Uint8Array(32);

    crypto.getRandomValues(Bytes);

    SaveKey = Array.from(
        Bytes,
        Byte => Byte
            .toString(16)
            .padStart(2, "0")
    ).join("");

    localStorage.setItem(
        SaveKeyName,
        SaveKey
    );

    return SaveKey;
}


function WriteLocalSave(SaveData) {
    localStorage.setItem(
        LocalSaveName,
        JSON.stringify(SaveData)
    );
}


function ReadLocalSave() {
    const RawSave = localStorage.getItem(
        LocalSaveName
    );

    if (RawSave === null) {
        return null;
    }

    try {
        return JSON.parse(RawSave);
    } catch (Error) {
        console.error(
            "Couldn't read local save:",
            Error
        );

        return null;
    }
}


async function WriteRemoteSave(SaveData) {
    const Response = await fetch(
        ApiUrl + "/Save.php",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                SaveKey: GetSaveKey(),
                SaveData: SaveData
            })
        }
    );

    if (!Response.ok) {
        throw new Error(
            "Save API returned HTTP " +
            Response.status
        );
    }

    const Result = await Response.json();

    if (!Result.Success) {
        throw new Error(
            Result.Error ??
            "Remote save failed."
        );
    }

    return Result;
}


async function ReadRemoteSave(
    SaveKey = GetSaveKey()
) {
    const Response = await fetch(
        ApiUrl + "/Load.php",
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
            "Remote load failed."
        );
    }

    if (!Result.Exists) {
        return null;
    }

    return Result.SaveData;
}

async function SaveGame(SaveData) {
    SaveData.Revision++;
    SaveData.LastSavedAt = Date.now();

    WriteLocalSave(SaveData);

    try {
        await WriteRemoteSave(SaveData);
    } catch (Error) {
        console.error(
            "Couldn't synchronize garden save:",
            Error
        );
    }
}


async function LoadGame() {
    const LocalSave = ReadLocalSave();

    let RemoteSave = null;

    try {
        RemoteSave = await ReadRemoteSave();
    } catch (Error) {
        console.error(
            "Couldn't retrieve remote save:",
            Error
        );
    }


    if (
        LocalSave === null &&
        RemoteSave === null
    ) {
        const NewSave = CreateNewSave();

        WriteLocalSave(NewSave);

        try {
            await WriteRemoteSave(NewSave);
        } catch (Error) {
            console.error(
                "Couldn't create remote save:",
                Error
            );
        }

        return NewSave;
    }


    if (
        LocalSave !== null &&
        RemoteSave === null
    ) {
        try {
            await WriteRemoteSave(LocalSave);
        } catch (Error) {
            console.error(
                "Couldn't upload local save:",
                Error
            );
        }

        return LocalSave;
    }


    if (
        LocalSave === null &&
        RemoteSave !== null
    ) {
        WriteLocalSave(RemoteSave);

        return RemoteSave;
    }


    if (
        LocalSave.Revision >
        RemoteSave.Revision
    ) {
        try {
            await WriteRemoteSave(LocalSave);
        } catch (Error) {
            console.error(
                "Couldn't update remote save:",
                Error
            );
        }

        return LocalSave;
    }


    if (
        RemoteSave.Revision >
        LocalSave.Revision
    ) {
        WriteLocalSave(RemoteSave);

        return RemoteSave;
    }


    if (
        RemoteSave.LastSavedAt >
        LocalSave.LastSavedAt
    ) {
        WriteLocalSave(RemoteSave);

        return RemoteSave;
    }

    return LocalSave;
}
