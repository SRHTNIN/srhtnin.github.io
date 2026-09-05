let ShopSave;
let ShopPurchasePending = false;
let ShopSeedSearchQuery = "";
let ShopSeedSortMode = "IdAsc";


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
    BindShopSeedControls();
    RenderShop();
}


function BindShopSectionToggles() {
    BindShopSectionToggle(
        "ToolsToggle",
        "ToolsContent"
    );

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


function BindShopSeedControls() {
    const SearchInput =
        document.getElementById(
            "ShopSeedSearchInput"
        );

    const SortSelect =
        document.getElementById(
            "ShopSeedSortSelect"
        );


    if (SearchInput !== null) {
        SearchInput.value =
            ShopSeedSearchQuery;

        SearchInput.addEventListener(
            "input",
            () => {
                ShopSeedSearchQuery =
                    SearchInput.value;

                RenderShopSeeds();
            }
        );
    }


    if (SortSelect !== null) {
        SortSelect.value =
            ShopSeedSortMode;

        SortSelect.addEventListener(
            "change",
            () => {
                ShopSeedSortMode =
                    SortSelect.value;

                RenderShopSeeds();
            }
        );
    }
}


function RenderShop() {
    RenderShopCurrency();
    RenderToolShop();
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
            );

    const SearchQuery =
        ShopSeedSearchQuery
            .trim()
            .toLocaleLowerCase();

    const VisiblePlants =
        AvailablePlants
            .filter(
                Plant =>
                    DoesShopPlantMatchSearch(
                        Plant,
                        SearchQuery
                    )
            )
            .sort(
                CompareShopPlants
            );


    if (AvailablePlants.length === 0) {
        AppendShopSeedEmptyMessage(
            SeedList,
            "No seeds are available yet."
        );

        return;
    }


    if (VisiblePlants.length === 0) {
        AppendShopSeedEmptyMessage(
            SeedList,
            "No seeds match your search."
        );

        return;
    }


    for (
        const Plant
        of VisiblePlants
    ) {
        SeedList.appendChild(
            CreateShopSeedCard(
                Plant
            )
        );
    }
}


function AppendShopSeedEmptyMessage(
    SeedList,
    Message
) {
    const EmptyMessage =
        document.createElement(
            "p"
        );

    EmptyMessage.className =
        "ShopEmpty";

    EmptyMessage.textContent =
        Message;

    SeedList.appendChild(
        EmptyMessage
    );
}


function DoesShopPlantMatchSearch(
    Plant,
    SearchQuery
) {
    if (SearchQuery.length === 0) {
        return true;
    }

    const SearchParts = [
        Plant.Id,
        Plant.Name,
        Plant.Description,
        ...(Array.isArray(Plant.Tags)
            ? Plant.Tags
            : [])
    ];

    return SearchParts
        .filter(
            Value =>
                Value !== null &&
                Value !== undefined
        )
        .join(" ")
        .toLocaleLowerCase()
        .includes(
            SearchQuery
        );
}


function CompareShopPlants(
    A,
    B
) {
    switch (ShopSeedSortMode) {
        case "NameAsc":
            return CompareShopText(
                A.Name,
                B.Name
            ) || A.Id - B.Id;

        case "PriceAsc":
            return CompareShopNumbers(
                GetPlantShopCost(ShopSave, A.Id),
                GetPlantShopCost(ShopSave, B.Id),
                1
            ) || A.Id - B.Id;

        case "PriceDesc":
            return CompareShopNumbers(
                GetPlantShopCost(ShopSave, A.Id),
                GetPlantShopCost(ShopSave, B.Id),
                -1
            ) || A.Id - B.Id;

        case "GrowthAsc":
            return CompareShopNumbers(
                A.GrowthTime,
                B.GrowthTime,
                1
            ) || A.Id - B.Id;

        case "GrowthDesc":
            return CompareShopNumbers(
                A.GrowthTime,
                B.GrowthTime,
                -1
            ) || A.Id - B.Id;

        case "RewardAsc":
            return CompareShopNumbers(
                GetPlantHarvestReward(ShopSave, A.Id),
                GetPlantHarvestReward(ShopSave, B.Id),
                1
            ) || A.Id - B.Id;

        case "RewardDesc":
            return CompareShopNumbers(
                GetPlantHarvestReward(ShopSave, A.Id),
                GetPlantHarvestReward(ShopSave, B.Id),
                -1
            ) || A.Id - B.Id;

        case "DphAsc":
            return CompareShopNumbers(
                GetPlantDewPerHour(ShopSave, A.Id),
                GetPlantDewPerHour(ShopSave, B.Id),
                1
            ) || A.Id - B.Id;

        case "DphDesc":
            return CompareShopNumbers(
                GetPlantDewPerHour(ShopSave, A.Id),
                GetPlantDewPerHour(ShopSave, B.Id),
                -1
            ) || A.Id - B.Id;

        case "InventoryAsc":
            return CompareShopNumbers(
                GetSeedCount(ShopSave, A.Id),
                GetSeedCount(ShopSave, B.Id),
                1
            ) || A.Id - B.Id;

        case "InventoryDesc":
            return CompareShopNumbers(
                GetSeedCount(ShopSave, A.Id),
                GetSeedCount(ShopSave, B.Id),
                -1
            ) || A.Id - B.Id;

        case "IdAsc":
        default:
            return A.Id - B.Id;
    }
}


function CompareShopText(
    A,
    B
) {
    return String(A ?? "")
        .localeCompare(
            String(B ?? ""),
            undefined,
            {sensitivity: "base"}
        );
}


function CompareShopNumbers(
    A,
    B,
    Direction
) {
    const MissingA =
        A === null ||
        A === undefined ||
        A === "";

    const MissingB =
        B === null ||
        B === undefined ||
        B === "";

    const NumberA = Number(A);
    const NumberB = Number(B);

    const ValidA =
        !MissingA &&
        Number.isFinite(NumberA);

    const ValidB =
        !MissingB &&
        Number.isFinite(NumberB);

    if (!ValidA && !ValidB) {
        return 0;
    }

    if (!ValidA) {
        return 1;
    }

    if (!ValidB) {
        return -1;
    }

    return (NumberA - NumberB) *
        Direction;
}


function RenderToolShop() {
    const ToolList =
        document.getElementById(
            "ShopToolList"
        );

    if (ToolList === null) {
        return;
    }


    ToolList.replaceChildren(
        CreateTrowelToolCard(),
        CreateToolUnlockCard(
            "MagicTrowel",
            "Magic trowel",
            "Plant the selected seed into as many empty plots as possible in one use.",
            [
                [
                    "Planting",
                    "All empty plots"
                ]
            ]
        ),
        CreateShovelToolCard(),
        CreateFertilizerToolCard(),
        CreateToolUnlockCard(
            "FutureSight",
            "Future Sight",
            "Preview what the Garden would look like if its next eligible mutation succeeded. Future Sight has a two-hour cooldown.",
            [
                [
                    "Cooldown",
                    "2 hours"
                ]
            ]
        )
    );
}


function CreateTrowelToolCard() {
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
        "ShopItemHeader ShopItemHeaderOwned";


    const Name =
        document.createElement(
            "h3"
        );

    Name.textContent = "Trowel";

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        "Your default planting tool. Select a seed, then use the Trowel on an empty plot.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Status",
            "Unlocked"
        ),
        CreateShopStat(
            "Cost",
            "Free"
        )
    );


    const Button =
        document.createElement(
            "button"
        );

    Button.className =
        "ActionButton ShopBuyButton";

    Button.type = "button";
    Button.textContent = "Default tool";
    Button.disabled = true;


    Card.append(
        Header,
        Description,
        Details,
        Button
    );

    return Card;
}


function CreateToolUnlockCard(
    Tool,
    NameText,
    DescriptionText,
    ExtraStats = []
) {
    const IsOwned =
        IsGardenToolUnlocked(
            ShopSave,
            Tool
        );

    const Cost =
        GetGardenToolUnlockCost(
            Tool
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

    Name.textContent = NameText;

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        DescriptionText;


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.appendChild(
        CreateShopStat(
            "Status",
            IsOwned
                ? "Unlocked"
                : "Locked"
        )
    );

    for (
        const [Label, Value]
        of ExtraStats
    ) {
        Details.appendChild(
            CreateShopStat(
                Label,
                Value
            )
        );
    }


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
            () => {
                BuyGardenTool(
                    Tool,
                    NameText
                );
            }
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


function CreateShovelToolCard() {
    const IsOwned =
        IsGardenToolUnlocked(
            ShopSave,
            "Shovel"
        );

    const Level =
        GetShovelLevel(
            ShopSave
        );

    const UpgradeCost =
        IsOwned
            ? GetShovelUpgradeCost(
                ShopSave
            )
            : null;


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

    Name.textContent = "Shovel";

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        "Remove planted crops. Upgrades recover more of the seed value instead of wasting it.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Status",
            IsOwned
                ? "Unlocked"
                : "Locked"
        ),
        CreateShopStat(
            IsOwned
                ? "Current"
                : "On unlock",
            GetShovelLevelDescription(
                Level
            )
        ),
        CreateShopStat(
            IsOwned
                ? "Next"
                : "First upgrade",
            Level >= ShovelMaximumLevel
                ? "Maximum level"
                : GetShovelLevelDescription(
                    Level + 1
                )
        )
    );


    const ActionButton =
        document.createElement(
            "button"
        );

    ActionButton.className =
        "ActionButton ShopBuyButton";

    ActionButton.type = "button";

    if (!IsOwned) {
        const UnlockCost =
            GetGardenToolUnlockCost(
                "Shovel"
            );

        ActionButton.textContent =
            "Buy - " +
            UnlockCost.toLocaleString() +
            " Dew";

        ActionButton.disabled =
            ShopSave.Currency.Dew <
                UnlockCost ||
            ShopPurchasePending;

        ActionButton.addEventListener(
            "click",
            () => {
                BuyGardenTool(
                    "Shovel",
                    "Shovel"
                );
            }
        );
    } else if (UpgradeCost === null) {
        ActionButton.textContent =
            "Maximum level";

        ActionButton.disabled = true;
    } else {
        ActionButton.textContent =
            "Upgrade - " +
            UpgradeCost.toLocaleString() +
            " Dew";

        ActionButton.disabled =
            ShopSave.Currency.Dew <
                UpgradeCost ||
            ShopPurchasePending;

        ActionButton.addEventListener(
            "click",
            BuyShovelUpgrade
        );
    }


    Card.append(
        Header,
        Description,
        Details,
        ActionButton
    );

    return Card;
}


function GetShovelLevelDescription(
    Level
) {
    if (Level <= 0) {
        return "Level 0 - returns nothing";
    }

    if (Level === 1) {
        return "Level 1 - returns 33% of seed cost";
    }

    if (Level === 2) {
        return "Level 2 - returns 66% of seed cost";
    }

    return "Level 3 - returns the planted seed";
}


function CreateFertilizerToolCard() {
    const IsOwned =
        IsGardenToolUnlocked(
            ShopSave,
            "Fertilizer"
        );

    const Level =
        GetFertilizerLevel(
            ShopSave
        );

    const UpgradeCost =
        IsOwned
            ? GetFertilizerUpgradeCost(
                ShopSave
            )
            : null;


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

    Name.textContent = "Fertilizer";

    Header.appendChild(Name);


    const Description =
        document.createElement(
            "p"
        );

    Description.textContent =
        "Spend Fertilizer uses to advance a growing plant. Stronger levels advance more growth per use.";


    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "ShopItemDetails";

    Details.append(
        CreateShopStat(
            "Status",
            IsOwned
                ? "Unlocked"
                : "Locked"
        ),
        CreateShopStat(
            "Current uses",
            Number(
                ShopSave.Inventory
                    .Fertilizer ?? 0
            ).toLocaleString()
        ),
        CreateShopStat(
            IsOwned
                ? "Current"
                : "On unlock",
            "Level " +
            Level +
            " - " +
            FertilizerGrowthMinutes[
                Level
            ] +
            " minutes"
        ),
        CreateShopStat(
            IsOwned
                ? "Next"
                : "First upgrade",
            Level >= FertilizerMaximumLevel
                ? "Maximum level"
                : "Level " +
                    (Level + 1) +
                    " - " +
                    FertilizerGrowthMinutes[
                        Level + 1
                    ] +
                    " minutes"
        )
    );


    const Actions =
        document.createElement(
            "div"
        );

    Actions.className =
        "ShopItemActions";


    const ActionButton =
        document.createElement(
            "button"
        );

    ActionButton.className =
        "ActionButton ShopBuyButton";

    ActionButton.type = "button";

    if (!IsOwned) {
        const UnlockCost =
            GetGardenToolUnlockCost(
                "Fertilizer"
            );

        ActionButton.textContent =
            "Buy - " +
            UnlockCost.toLocaleString() +
            " Dew";

        ActionButton.disabled =
            ShopSave.Currency.Dew <
                UnlockCost ||
            ShopPurchasePending;

        ActionButton.addEventListener(
            "click",
            () => {
                BuyGardenTool(
                    "Fertilizer",
                    "Fertilizer"
                );
            }
        );
    } else if (UpgradeCost === null) {
        ActionButton.textContent =
            "Maximum level";

        ActionButton.disabled = true;
    } else {
        ActionButton.textContent =
            "Upgrade - " +
            UpgradeCost.toLocaleString() +
            " Dew";

        ActionButton.disabled =
            ShopSave.Currency.Dew <
                UpgradeCost ||
            ShopPurchasePending;

        ActionButton.addEventListener(
            "click",
            BuyFertilizerUpgrade
        );
    }

    Actions.appendChild(
        ActionButton
    );


    if (IsOwned) {
        for (const Amount of [1, 10]) {
            const Cost =
                GetFertilizerUseCost(
                    Amount
                );

            const Button =
                document.createElement(
                    "button"
                );

            Button.className =
                "ActionButton ShopBuyButton";

            Button.type = "button";

            Button.textContent =
                "Buy uses ×" +
                Amount +
                " - " +
                Cost.toLocaleString() +
                " Dew";

            Button.disabled =
                ShopSave.Currency.Dew < Cost ||
                ShopPurchasePending;

            Button.addEventListener(
                "click",
                () => {
                    BuyFertilizerUses(
                        Amount
                    );
                }
            );

            Actions.appendChild(
                Button
            );
        }
    }


    Card.append(
        Header,
        Description,
        Details,
        Actions
    );

    return Card;
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

async function BuyGardenTool(
    Tool,
    Name
) {
    if (
        ShopPurchasePending ||
        IsGardenToolUnlocked(
            ShopSave,
            Tool
        )
    ) {
        return;
    }


    const Cost =
        GetGardenToolUnlockCost(
            Tool
        );

    if (Cost === null) {
        return;
    }

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for " +
            Name +
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

        UnlockGardenTool(
            ShopSave,
            Tool
        );


        SetShopMessage(
            "Unlocked " +
            Name +
            " for " +
            Cost.toLocaleString() +
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


async function BuyShovelUpgrade() {
    if (
        ShopPurchasePending ||
        !IsGardenToolUnlocked(
            ShopSave,
            "Shovel"
        )
    ) {
        return;
    }


    const Cost =
        GetShovelUpgradeCost(
            ShopSave
        );

    if (Cost === null) {
        return;
    }

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for the next Shovel upgrade."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;

        if (!UpgradeShovel(ShopSave)) {
            return;
        }


        SetShopMessage(
            "Upgraded Shovel to level " +
            GetShovelLevel(
                ShopSave
            ) +
            " for " +
            Cost.toLocaleString() +
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


async function BuyFertilizerUpgrade() {
    if (
        ShopPurchasePending ||
        !IsGardenToolUnlocked(
            ShopSave,
            "Fertilizer"
        )
    ) {
        return;
    }


    const Cost =
        GetFertilizerUpgradeCost(
            ShopSave
        );

    if (Cost === null) {
        return;
    }

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for the next Fertilizer upgrade."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;

        if (!UpgradeFertilizer(ShopSave)) {
            return;
        }


        SetShopMessage(
            "Upgraded Fertilizer to level " +
            GetFertilizerLevel(
                ShopSave
            ) +
            " for " +
            Cost.toLocaleString() +
            " Dew. Each use now advances " +
            GetFertilizerGrowthMinutes(
                ShopSave
            ) +
            " minutes."
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


async function BuyFertilizerUses(
    Amount
) {
    if (
        ShopPurchasePending ||
        !IsGardenToolUnlocked(
            ShopSave,
            "Fertilizer"
        )
    ) {
        return;
    }


    Amount = Math.max(
        1,
        Math.floor(
            Number(Amount) || 1
        )
    );

    const Cost =
        GetFertilizerUseCost(
            Amount
        );

    if (
        ShopSave.Currency.Dew <
        Cost
    ) {
        SetShopMessage(
            "You don't have enough Dew for that much Fertilizer."
        );

        return;
    }


    ShopPurchasePending = true;

    try {
        ShopSave.Currency.Dew -=
            Cost;

        ShopSave.Statistics.CurrencySpent.Dew +=
            Cost;

        AddFertilizerUses(
            ShopSave,
            Amount
        );


        SetShopMessage(
            "Bought " +
            Amount.toLocaleString() +
            (Amount === 1
                ? " Fertilizer use for "
                : " Fertilizer uses for ") +
            Cost.toLocaleString() +
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
