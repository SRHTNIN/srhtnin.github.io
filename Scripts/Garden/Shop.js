let ShopSave;
let ShopPurchasePending = false;


async function StartShop() {
    try {
        await LoadGameContent();
    } catch (Error) {
        console.error(
            "Couldn't load Shop content:",
            Error
        );

        SetShopMessage(
            "Couldn't load plant or mutation data."
        );

        return;
    }


    ShopSave = await LoadGame();

    RenderShop();
}


function RenderShop() {
    RenderShopCurrency();
    RenderShopSeeds();
}


function RenderShopCurrency() {
    const DewAmount =
        document.getElementById(
            "ShopDewAmount"
        );

    if (DewAmount === null) {
        return;
    }

    DewAmount.textContent =
        ShopSave.Currency.Dew
            .toLocaleString();
}


function RenderShopSeeds() {
    const SeedList =
        document.getElementById(
            "ShopSeedList"
        );

    SeedList.replaceChildren();


    const AvailablePlants =
        Object.values(Plants)
            .filter(
                Plant =>
                    IsPlantAvailableInShop(
                        ShopSave,
                        Plant
                    )
            )
            .sort(
                (A, B) =>
                    A.Id - B.Id
            );


    if (
        AvailablePlants.length === 0
    ) {
        const EmptyMessage =
            document.createElement(
                "p"
            );

        EmptyMessage.className =
            "ShopEmpty";

        EmptyMessage.textContent =
            "No seeds are available yet.";

        SeedList.appendChild(
            EmptyMessage
        );

        return;
    }


    for (
        const Plant
        of AvailablePlants
    ) {
        SeedList.appendChild(
            CreateShopSeedCard(
                Plant
            )
        );
    }
}


function CreateShopSeedCard(
    Plant
) {
    const Card =
        document.createElement(
            "article"
        );

    Card.className =
        "Panel ShopItem";


    const Header =
        document.createElement(
            "div"
        );

    Header.className =
        "ShopItemHeader";


    const Name =
        document.createElement(
            "h3"
        );

    Name.textContent =
        Plant.Name;


    Header.append(
        Name
    );


    const Body =
        document.createElement(
            "div"
        );

    Body.className =
        "ShopItemBody";


    const Visual =
        CreateShopPlantVisual(
            Plant
        );


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";


    if (
        typeof Plant.Description ===
            "string" &&
        Plant.Description.length > 0
    ) {
        const Description =
            document.createElement(
                "p"
            );

        Description.textContent =
            Plant.Description;

        Details.appendChild(
            Description
        );
    }


    Details.appendChild(
        CreateShopStat(
            "Growth time",
            FormatShopGrowthTime(
                Plant.GrowthTime
            )
        )
    );


    const Cost =
        GetPlantShopCost(
            ShopSave,
            Plant.Id
        );

    const Reward =
        GetPlantHarvestReward(
            ShopSave,
            Plant.Id
        );

    const DewPerHour =
        GetPlantDewPerHour(
            ShopSave,
            Plant.Id
        );


    Details.appendChild(
        CreateShopStat(
            "Seed cost",
            Cost === null
                ? "Unavailable"
                : Cost.toLocaleString() +
                    " Dew"
        )
    );

    Details.appendChild(
        CreateShopStat(
            "Harvest reward",
            Reward === null
                ? "Unavailable"
                : Reward.toLocaleString() +
                    " Dew"
        )
    );

    Details.appendChild(
        CreateShopStat(
            "Dew / hour",
            FormatDewPerHour(
                DewPerHour
            )
        )
    );

    Details.appendChild(
        CreateShopStat(
            "Inventory",
            GetSeedCount(
                ShopSave,
                Plant.Id
            ).toLocaleString()
        )
    );


    Body.append(
        Visual,
        Details
    );


    const BuyButton =
        document.createElement(
            "button"
        );

    BuyButton.className =
        "ActionButton ShopBuyButton";

    BuyButton.type = "button";

    BuyButton.textContent =
        Cost === null
            ? "Unavailable"
            : "Buy seed - " +
                Cost.toLocaleString() +
                " Dew";

    BuyButton.disabled =
        Cost === null ||
        ShopSave.Currency.Dew <
            Cost ||
        ShopPurchasePending;

    BuyButton.addEventListener(
        "click",
        () => {
            BuyPlantSeed(
                Plant.Id
            );
        }
    );


    Card.append(
        Header,
        Body,
        BuyButton
    );


    return Card;
}


function CreateShopPlantVisual(
    Plant
) {
    const Visual =
        document.createElement(
            "div"
        );

    Visual.className =
        "ShopPlantVisual";


    const ImageFrame =
        document.createElement(
            "div"
        );

    ImageFrame.className =
        "PlantTile ShopPlantImageFrame";


    const PlantKey =
        GetPlantKeyById(
            Plant.Id
        );

    const Images =
        PlantKey === null
            ? []
            : PlantImages[
                PlantKey
            ] ?? [];


    if (Images.length === 0) {
        const Missing =
            document.createElement(
                "span"
            );

        Missing.className =
            "ShopPlantMissing";

        Missing.textContent =
            "No image";

        ImageFrame.appendChild(
            Missing
        );
    } else {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite";

        Image.src =
            Images[
                Images.length - 1
            ];

        Image.alt =
            Plant.Name;

        ImageFrame.appendChild(
            Image
        );
    }


    const Number =
        document.createElement(
            "span"
        );

    Number.className =
        "ShopItemNumber";

    Number.textContent =
        String(
            Plant.Id
        ).padStart(
            3,
            "0"
        );


    Visual.append(
        ImageFrame,
        Number
    );


    return Visual;
}


function FormatShopGrowthTime(
    Milliseconds
) {
    const TotalMinutes =
        Math.max(
            1,
            Math.ceil(
                Number(
                    Milliseconds
                ) /
                60000
            )
        );

    const Hours =
        Math.floor(
            TotalMinutes /
            60
        );

    const Minutes =
        TotalMinutes %
        60;


    if (
        Hours > 0 &&
        Minutes > 0
    ) {
        return (
            Hours +
            "h " +
            Minutes +
            "m"
        );
    }

    if (Hours > 0) {
        return Hours + "h";
    }

    return Minutes + "m";
}


function CreateShopStat(
    Name,
    Value
) {
    const Row =
        document.createElement(
            "p"
        );

    Row.className =
        "ShopStat";


    const Label =
        document.createElement(
            "span"
        );

    Label.className =
        "ShopStatName";

    Label.textContent =
        Name + ":";


    const Amount =
        document.createElement(
            "strong"
        );

    Amount.textContent =
        Value;


    Row.append(
        Label,
        Amount
    );


    return Row;
}


async function BuyPlantSeed(
    PlantId
) {
    if (ShopPurchasePending) {
        return;
    }


    const Plant =
        GetPlantById(
            PlantId
        );

    if (
        Plant === null ||
        !IsPlantAvailableInShop(
            ShopSave,
            Plant
        )
    ) {
        return;
    }


    const Cost =
        GetPlantShopCost(
            ShopSave,
            PlantId
        );

    if (Cost === null) {
        SetShopMessage(
            "That seed doesn't have a purchasable recipe yet."
        );

        return;
    }


    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for " +
            Plant.Name +
            "."
        );

        return;
    }


    ShopPurchasePending = true;

    ShopSave.Currency.Dew -=
        Cost;

    ShopSave.Statistics.CurrencySpent.Dew +=
        Cost;

    ShopSave.Statistics.SeedsPurchased++;

    AddSeed(
        ShopSave,
        PlantId
    );

    DiscoverPlant(
        ShopSave,
        PlantId
    );

    SetShopMessage(
        "Bought a " +
        Plant.Name +
        " seed for " +
        Cost +
        " Dew."
    );

    RenderShop();


    await SaveGame(
        ShopSave
    );


    ShopPurchasePending = false;
    RenderShop();
}


function SetShopMessage(
    Message
) {
    const Element =
        document.getElementById(
            "ShopMessage"
        );

    if (Element !== null) {
        Element.textContent =
            Message;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartShop
);
