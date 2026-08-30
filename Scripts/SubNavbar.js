function StartSubNavbar() {
    const SubNavbar =
        document.querySelector(
            ".SubNavbar"
        );

    if (SubNavbar === null) {
        return;
    }

    const Links = [
        ...SubNavbar.querySelectorAll(
            ".SubNavbarLink"
        )
    ];

    const AnchorLinks =
        Links.filter(
            Link =>
                Link.getAttribute(
                    "href"
                )?.startsWith("#")
        );


    function SetCurrentLink(
        CurrentLink
    ) {
        for (
            const Link
            of AnchorLinks
        ) {
            Link.removeAttribute(
                "aria-current"
            );
        }

        if (CurrentLink !== null) {
            CurrentLink.setAttribute(
                "aria-current",
                "location"
            );
        }
    }


    function UpdateFromHash() {
        if (location.hash === "") {
            return;
        }

        const CurrentLink =
            AnchorLinks.find(
                Link =>
                    Link.getAttribute(
                        "href"
                    ) === location.hash
            ) ?? null;

        SetCurrentLink(
            CurrentLink
        );
    }


    for (
        const Link
        of AnchorLinks
    ) {
        Link.addEventListener(
            "click",
            () => {
                SetCurrentLink(
                    Link
                );
            }
        );
    }


    window.addEventListener(
        "hashchange",
        UpdateFromHash
    );

    UpdateFromHash();
}


document.addEventListener(
    "DOMContentLoaded",
    StartSubNavbar
);
