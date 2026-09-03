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

    BindShopSectionToggles();
    RenderShop();
}


function BindShopSectionToggles() {
    BindShopSectionToggle(
        "PermanentUpgradesToggle",
        "PermanentUpgradesContent"
    );

    BindShopSectionToggle(
        "SeedsToggle",
        "SeedsContent"
    );
}


function BindShopSectionToggle(
    ToggleId,
    ContentId
) {
    const Toggle =
        document.getElementById(
            ToggleId
        );

    const Content =
        document.getElementById(
            ContentId
        );

    if (
        Toggle === null ||
        Content === null
    ) {
        return;
    }

    Toggle.addEventListener(
        "click",
        () => {
            const IsExpanded =
                Toggle.getAttribute(
                    "aria-expanded"
                ) === "true";

            const NewExpanded =
                !IsExpanded;

            Toggle.setAttribute(
                "aria-expanded",
                String(NewExpanded)
            );

            Content.hidden =
                !NewExpanded;

        }
    );
}


function RenderShop() {
    RenderShopCurrency();
    RenderShopSeeds();
    RenderGardenUpgrades();
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


function RenderGardenUpgrades() {
    const UpgradeList =
        document.getElementById(
            "ShopGardenUpgradeList"
        );

    if (UpgradeList === null) {
        return;
    }

    UpgradeList.replaceChildren(
        CreateGardenExpansionCard(
            "Column"
        ),
        CreateGardenExpansionCard(
            "Row"
        ),
        CreateNewGardenCard(),
        CreatePlantInformationUpgradeCard(),
        CreateGardenOverviewUpgradeCard(),
        CreateGardenEconomyUpgradeCard(),
        CreateMutationHintsUpgradeCard()
    );
}


function CreateGardenExpansionCard(
    Direction
) {
    const IsColumn =
        Direction === "Column";

    const AddedPlots =
        IsColumn
            ? ShopSave.Garden.Height
            : ShopSave.Garden.Width;

    const Cost =
        IsColumn
            ? GetGardenColumnUpgradeCost(
                ShopSave
            )
            : GetGardenRowUpgradeCost(
                ShopSave
            );

    const NewWidth =
        ShopSave.Garden.Width +
        (IsColumn ? 1 : 0);

    const NewHeight =
        ShopSave.Garden.Height +
        (IsColumn ? 0 : 1);


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
        "Add " +
        Direction.toLowerCase();

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        IsColumn
            ? "Add one column to the right side of your Garden."
            : "Add one row to the bottom of your Garden.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Garden",
            ShopSave.Garden.Name
        ),
        CreateShopStat(
            "Current size",
            ShopSave.Garden.Width +
                "×" +
                ShopSave.Garden.Height
        ),
        CreateShopStat(
            "Adds",
            AddedPlots.toLocaleString() +
                (AddedPlots === 1
                    ? " plot"
                    : " plots")
        ),
        CreateShopStat(
            "New size",
            NewWidth +
                "×" +
                NewHeight
        )
    );


    const BuyButton =
        document.createElement(
            "button"
        );

    BuyButton.className =
        "ActionButton ShopBuyButton";

    BuyButton.type = "button";

    BuyButton.textContent =
        "Buy - " +
        Cost.toLocaleString() +
        " Dew";

    BuyButton.disabled =
        ShopSave.Currency.Dew < Cost ||
        ShopPurchasePending;

    BuyButton.addEventListener(
        "click",
        () => {
            BuyGardenExpansion(
                Direction
            );
        }
    );


    Card.append(
        Header,
        Description,
        Details,
        BuyButton
    );


    return Card;
}


function CreateNewGardenCard() {
    const Cost =
        GetNewGardenCost(
            ShopSave
        );

    const GardensOwned =
        ShopSave.Gardens.length;


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
        "Buy new Garden";

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        "Buy another independent 3×3 Garden. New Gardens can be named and expanded separately.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Gardens owned",
            GardensOwned.toLocaleString()
        ),
        CreateShopStat(
            "New Garden size",
            "3×3 (9 plots)"
        ),
        CreateShopStat(
            "Price scaling",
            "+50% per Garden"
        )
    );


    const BuyButton =
        document.createElement(
            "button"
        );

    BuyButton.className =
        "ActionButton ShopBuyButton";

    BuyButton.type = "button";

    BuyButton.textContent =
        "Buy - " +
        Cost.toLocaleString() +
        " Dew";

    BuyButton.disabled =
        ShopSave.Currency.Dew < Cost ||
        ShopPurchasePending;

    BuyButton.addEventListener(
        "click",
        BuyNewGarden
    );


    Card.append(
        Header,
        Description,
        Details,
        BuyButton
    );


    return Card;
}


function CreatePlantInformationUpgradeCard() {
    const Cost =
        GetPlantInformationUpgradeCost();

    const IsOwned =
        HasPlantInformationUpgrade(
            ShopSave
        );


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
        "ShopItemHeader" +
        (
            IsOwned
                ? " ShopItemHeaderOwned"
                : ""
        );


    const Name =
        document.createElement(
            "h3"
        );

    Name.textContent =
        "Plant information";

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        "Show each plant's name above its sprite and exact time remaining below it. Both can be toggled on/off from the profile page.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Plant names",
            IsOwned
                ? "Unlocked"
                : "Locked"
        ),
        CreateShopStat(
            "Growth timers",
            IsOwned
                ? "Unlocked"
                : "Locked"
        )
    );


    const BuyButton =
        document.createElement(
            "button"
        );

    BuyButton.className =
        "ActionButton ShopBuyButton";

    BuyButton.type = "button";

    if (IsOwned) {
        BuyButton.textContent =
            "Purchased";

        BuyButton.disabled = true;
    } else {
        BuyButton.textContent =
            "Buy - " +
            Cost.toLocaleString() +
            " Dew";

        BuyButton.disabled =
            ShopSave.Currency.Dew < Cost ||
            ShopPurchasePending;

        BuyButton.addEventListener(
            "click",
            BuyPlantInformationUpgrade
        );
    }


    Card.append(
        Header,
        Description,
        Details,
        BuyButton
    );


    return Card;
}


function CreateGardenOverviewUpgradeCard() {
    const Cost =
        GetGardenOverviewUpgradeCost();

    const IsOwned =
        HasGardenOverviewUpgrade(
            ShopSave
        );


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
        "ShopItemHeader" +
        (
            IsOwned
                ? " ShopItemHeaderOwned"
                : ""
        );


    const Name =
        document.createElement(
            "h3"
        );

    Name.textContent =
        "Garden overview";

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        "Expand the Garden status box with detailed plot counts and the name of the next plant ready to harvest. Every overview line can be toggled on/off from the profile page.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Garden details",
            IsOwned
                ? "Unlocked"
                : "Locked"
        ),
        CreateShopStat(
            "Profile controls",
            IsOwned
                ? "Unlocked"
                : "Locked"
        )
    );


    const BuyButton =
        document.createElement(
            "button"
        );

    BuyButton.className =
        "ActionButton ShopBuyButton";

    BuyButton.type = "button";

    if (IsOwned) {
        BuyButton.textContent =
            "Purchased";

        BuyButton.disabled = true;
    } else {
        BuyButton.textContent =
            "Buy - " +
            Cost.toLocaleString() +
            " Dew";

        BuyButton.disabled =
            ShopSave.Currency.Dew < Cost ||
            ShopPurchasePending;

        BuyButton.addEventListener(
            "click",
            BuyGardenOverviewUpgrade
        );
    }


    Card.append(
        Header,
        Description,
        Details,
        BuyButton
    );


    return Card;
}


function CreateGardenEconomyUpgradeCard() {
    const Cost =
        GetGardenEconomyUpgradeCost();

    const IsOwned =
        HasGardenEconomyUpgrade(
            ShopSave
        );


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
        "ShopItemHeader" +
        (
            IsOwned
                ? " ShopItemHeaderOwned"
                : ""
        );


    const Name =
        document.createElement(
            "h3"
        );

    Name.textContent =
        "Garden economy";

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        "Add live economy information for the active Garden: Dew invested, total harvest value, net profit after replanting, and Farm DPH.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Garden economics",
            IsOwned
                ? "Unlocked"
                : "Locked"
        ),
        CreateShopStat(
            "Scope",
            "Active Garden"
        )
    );


    const BuyButton =
        document.createElement(
            "button"
        );

    BuyButton.className =
        "ActionButton ShopBuyButton";

    BuyButton.type = "button";

    if (IsOwned) {
        BuyButton.textContent =
            "Purchased";

        BuyButton.disabled = true;
    } else {
        BuyButton.textContent =
            "Buy - " +
            Cost.toLocaleString() +
            " Dew";

        BuyButton.disabled =
            ShopSave.Currency.Dew < Cost ||
            ShopPurchasePending;

        BuyButton.addEventListener(
            "click",
            BuyGardenEconomyUpgrade
        );
    }


    Card.append(
        Header,
        Description,
        Details,
        BuyButton
    );


    return Card;
}


function CreateMutationHintsUpgradeCard() {
    const Cost =
        GetMutationHintsUpgradeCost();

    const IsOwned =
        HasMutationHintsUpgrade(
            ShopSave
        );


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
        "ShopItemHeader" +
        (
            IsOwned
                ? " ShopItemHeaderOwned"
                : ""
        );


    const Name =
        document.createElement(
            "h3"
        );

    Name.textContent =
        "Mutation hints";

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        "Show subtle hints for undiscovered mutations once you've discovered the plants needed to attempt them. Hints appear in the Mutation encyclopedia without revealing the recipe.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Mutation hints",
            IsOwned
                ? "Unlocked"
                : "Locked"
        ),
        CreateShopStat(
            "Requirements",
            "Required plants discovered"
        )
    );


    const BuyButton =
        document.createElement(
            "button"
        );

    BuyButton.className =
        "ActionButton ShopBuyButton";

    BuyButton.type = "button";

    if (IsOwned) {
        BuyButton.textContent =
            "Purchased";

        BuyButton.disabled = true;
    } else {
        BuyButton.textContent =
            "Buy - " +
            Cost.toLocaleString() +
            " Dew";

        BuyButton.disabled =
            ShopSave.Currency.Dew < Cost ||
            ShopPurchasePending;

        BuyButton.addEventListener(
            "click",
            BuyMutationHintsUpgrade
        );
    }


    Card.append(
        Header,
        Description,
        Details,
        BuyButton
    );


    return Card;
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


    const BuyOptions =
        document.createElement(
            "div"
        );

    BuyOptions.className =
        "ShopSeedBuyOptions";


    const GardenSize =
        Math.max(
            1,
            ShopSave.Garden.Width *
            ShopSave.Garden.Height
        );

    const PurchaseOptions = [
        {
            Amount: 1,
            Label: "Buy seed"
        },
        {
            Amount: 10,
            Label: "Buy 10 seeds"
        },
        {
            Amount: GardenSize,
            Label:
                "Buy " +
                GardenSize.toLocaleString() +
                " seeds"
        }
    ];


    for (
        const Option
        of PurchaseOptions
    ) {
        const BuyButton =
            document.createElement(
                "button"
            );

        BuyButton.className =
            "ActionButton ShopBuyButton";

        BuyButton.type = "button";


        const TotalCost =
            Cost === null
                ? null
                : Cost * Option.Amount;

        BuyButton.textContent =
            TotalCost === null
                ? "Unavailable"
                : Option.Label +
                    " - " +
                    TotalCost.toLocaleString() +
                    " Dew";

        BuyButton.disabled =
            TotalCost === null ||
            ShopSave.Currency.Dew <
                TotalCost ||
            ShopPurchasePending;

        BuyButton.addEventListener(
            "click",
            () => {
                BuyPlantSeed(
                    Plant.Id,
                    Option.Amount
                );
            }
        );

        BuyOptions.appendChild(
            BuyButton
        );
    }


    Card.append(
        Header,
        Body,
        BuyOptions
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


    const MatureImage =
        GetPlantMatureImageSource(
            Plant
        );


    if (MatureImage === null) {
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
            MatureImage;

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
    PlantId,
    Amount = 1
) {
    if (ShopPurchasePending) {
        return;
    }


    Amount = Math.max(
        1,
        Math.floor(
            Number(Amount) || 1
        )
    );


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


    const UnitCost =
        GetPlantShopCost(
            ShopSave,
            PlantId
        );

    if (UnitCost === null) {
        SetShopMessage(
            "That seed doesn't have a purchasable recipe yet."
        );

        return;
    }


    const TotalCost =
        UnitCost * Amount;

    if (
        ShopSave.Currency.Dew <
        TotalCost
    ) {
        SetShopMessage(
            "You don't have enough Dew for " +
            Amount.toLocaleString() +
            (Amount === 1
                ? " seed of "
                : " seeds of ") +
            Plant.Name +
            "."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            TotalCost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            TotalCost;

        ShopSave.Statistics.SeedsPurchased +=
            Amount;

        AddSeed(
            ShopSave,
            PlantId,
            Amount
        );

        DiscoverPlant(
            ShopSave,
            PlantId
        );


        SetShopMessage(
            "Bought " +
            Amount.toLocaleString() +
            " " +
            Plant.Name +
            (Amount === 1
                ? " seed for "
                : " seeds for ") +
            TotalCost.toLocaleString() +
            " Dew."
        );

        RenderShop();

        await SaveGame(
            ShopSave
        );
    } finally {
        ShopPurchasePending = false;
        RenderShop();
    }
}

async function BuyGardenExpansion(
    Direction
) {
    if (ShopPurchasePending) {
        return;
    }


    const IsColumn =
        Direction === "Column";

    const IsRow =
        Direction === "Row";

    if (
        !IsColumn &&
        !IsRow
    ) {
        return;
    }


    const Cost =
        IsColumn
            ? GetGardenColumnUpgradeCost(
                ShopSave
            )
            : GetGardenRowUpgradeCost(
                ShopSave
            );

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew to add a " +
            Direction.toLowerCase() +
            "."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;


        if (IsColumn) {
            AddGardenColumn(
                ShopSave
            );
        } else {
            AddGardenRow(
                ShopSave
            );
        }


        SetShopMessage(
            "Added a Garden " +
            Direction.toLowerCase() +
            " for " +
            Cost.toLocaleString() +
            " Dew. Garden size is now " +
            ShopSave.Garden.Width +
            "×" +
            ShopSave.Garden.Height +
            "."
        );

        RenderShop();

        await SaveGame(
            ShopSave
        );
    } finally {
        ShopPurchasePending = false;
        RenderShop();
    }
}


async function BuyNewGarden() {
    if (ShopPurchasePending) {
        return;
    }


    const Cost =
        GetNewGardenCost(
            ShopSave
        );

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for a new Garden."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;

        AddNewGarden(
            ShopSave
        );

        SetShopMessage(
            "Bought a new 3×3 Garden for " +
            Cost.toLocaleString() +
            " Dew. It is now your active Garden."
        );

        RenderShop();

        await SaveGame(
            ShopSave
        );
    } finally {
        ShopPurchasePending = false;
        RenderShop();
    }
}


async function BuyPlantInformationUpgrade() {
    if (
        ShopPurchasePending ||
        HasPlantInformationUpgrade(
            ShopSave
        )
    ) {
        return;
    }


    const Cost =
        GetPlantInformationUpgradeCost();

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for Plant information."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;

        UnlockPlantInformation(
            ShopSave
        );


        SetShopMessage(
            "Bought Plant information for " +
            Cost.toLocaleString() +
            " Dew. Plant names and growth timers are now visible."
        );

        RenderShop();

        await SaveGame(
            ShopSave
        );
    } finally {
        ShopPurchasePending = false;
        RenderShop();
    }
}


async function BuyGardenOverviewUpgrade() {
    if (
        ShopPurchasePending ||
        HasGardenOverviewUpgrade(
            ShopSave
        )
    ) {
        return;
    }


    const Cost =
        GetGardenOverviewUpgradeCost();

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for Garden overview."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;

        UnlockGardenOverview(
            ShopSave
        );


        SetShopMessage(
            "Bought Garden overview for " +
            Cost.toLocaleString() +
            " Dew. All overview lines are now visible."
        );

        RenderShop();

        await SaveGame(
            ShopSave
        );
    } finally {
        ShopPurchasePending = false;
        RenderShop();
    }
}


async function BuyGardenEconomyUpgrade() {
    if (
        ShopPurchasePending ||
        HasGardenEconomyUpgrade(
            ShopSave
        )
    ) {
        return;
    }


    const Cost =
        GetGardenEconomyUpgradeCost();

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for Garden economy."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;

        UnlockGardenEconomy(
            ShopSave
        );


        SetShopMessage(
            "Bought Garden economy for " +
            Cost.toLocaleString() +
            " Dew. Economy information is now visible on the Garden page."
        );

        RenderShop();

        await SaveGame(
            ShopSave
        );
    } finally {
        ShopPurchasePending = false;
        RenderShop();
    }
}


async function BuyMutationHintsUpgrade() {
    if (
        ShopPurchasePending ||
        HasMutationHintsUpgrade(
            ShopSave
        )
    ) {
        return;
    }


    const Cost =
        GetMutationHintsUpgradeCost();

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for Mutation hints."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;

        UnlockMutationHints(
            ShopSave
        );


        SetShopMessage(
            "Bought Mutation hints for " +
            Cost.toLocaleString() +
            " Dew. Eligible hints are now visible in the Mutation encyclopedia."
        );

        RenderShop();

        await SaveGame(
            ShopSave
        );
    } finally {
        ShopPurchasePending = false;
        RenderShop();
    }
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
