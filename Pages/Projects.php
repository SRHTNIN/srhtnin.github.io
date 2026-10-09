<?php

$PageTitle = "Projects";

$DownloadBase = "https://view.srhtnin.garden/api/download?Root=Files&Path=Shared/";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1 id="Projects">Projects</h1>

            <p>
                These are some of the things I've made that you can download and try for yourself.
            </p>

            <h2 id="Apeiron">Apeiron</h2>

            <p>
                A game I'm making in Godot.
                "You are naught but walking flesh."
                Download the version for your operating system, run it, and have fun!
            </p>

            <div class="DownloadButtons">
                <a
                    class="ActionButton DownloadButton DownloadButtonWindows"
                    href="<?= htmlspecialchars($DownloadBase . "Apeiron/Apeiron.exe", ENT_QUOTES, "UTF-8") ?>"
                    download
                >
                    Windows
                    <span class="DownloadButtonFile">Apeiron.exe</span>
                </a>

                <a
                    class="ActionButton DownloadButton DownloadButtonLinux"
                    href="<?= htmlspecialchars($DownloadBase . "Apeiron/Apeiron.x86_64", ENT_QUOTES, "UTF-8") ?>"
                    download
                >
                    Linux
                    <span class="DownloadButtonFile">Apeiron.x86_64</span>
                </a>
            </div>

            <p>
                On Linux, you might have to make the file executable first:
            </p>

            <pre><code>chmod +x Apeiron.x86_64</code></pre>

            <h2 id="SaraSuite">SaraSuite</h2>

            <p>
                Installs, updates and removes my Sara programs.
                It's a single file for Windows or Linux: download it, run it, and pick a program.
                Your own config edits are kept when a program updates,
                and removing a program takes out everything it installed.
            </p>

            <div class="DownloadButtons">
                <a
                    class="ActionButton DownloadButton DownloadButtonWindows"
                    href="<?= htmlspecialchars($DownloadBase . "SaraSuite/SaraSuite.exe", ENT_QUOTES, "UTF-8") ?>"
                    download
                >
                    Windows
                    <span class="DownloadButtonFile">SaraSuite.exe</span>
                </a>

                <a
                    class="ActionButton DownloadButton DownloadButtonLinux"
                    href="<?= htmlspecialchars($DownloadBase . "SaraSuite/SaraSuite-x86_64.AppImage", ENT_QUOTES, "UTF-8") ?>"
                    download
                >
                    Linux
                    <span class="DownloadButtonFile">SaraSuite-x86_64.AppImage</span>
                </a>
            </div>

            <p>
                On Linux, you might have to make the file executable first:
            </p>

            <pre><code>chmod +x SaraSuite-x86_64.AppImage</code></pre>
        </main>

        <script src="/Scripts/Script.js"></script>
    </body>
</html>
