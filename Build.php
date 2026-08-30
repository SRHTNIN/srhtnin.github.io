<?php

declare(strict_types=1);

$RootDirectory = __DIR__;
$OutputDirectory = $RootDirectory . "/_Site";
$PagesDirectory = $RootDirectory . "/Pages";


function RemoveDirectory(string $Directory): void
{
    if (!is_dir($Directory)) {
        return;
    }

    $Iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(
            $Directory,
            FilesystemIterator::SKIP_DOTS
        ),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($Iterator as $Item) {
        if ($Item->isDir()) {
            rmdir($Item->getPathname());
        } else {
            unlink($Item->getPathname());
        }
    }

    rmdir($Directory);
}


function CopyDirectory(
    string $Source,
    string $Destination
): void {
    if (!is_dir($Destination)) {
        mkdir($Destination, 0777, true);
    }

    $Iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(
            $Source,
            FilesystemIterator::SKIP_DOTS
        ),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($Iterator as $Item) {
        $RelativePath = $Iterator->getSubPathName();
        $DestinationPath = $Destination . "/" . $RelativePath;

        if ($Item->isDir()) {
            if (!is_dir($DestinationPath)) {
                mkdir($DestinationPath, 0777, true);
            }

            continue;
        }

        copy(
            $Item->getPathname(),
            $DestinationPath
        );
    }
}


function RenderPage(
    string $SourceFile,
    string $DestinationFile,
    string $RootPath
): void {
    $DestinationDirectory = dirname($DestinationFile);

    if (!is_dir($DestinationDirectory)) {
        mkdir($DestinationDirectory, 0777, true);
    }

    ob_start();

    try {
        require $SourceFile;
        $Contents = ob_get_clean();
    } catch (Throwable $Exception) {
        ob_end_clean();

        throw $Exception;
    }

    if ($Contents === false) {
        throw new RuntimeException(
            "Failed to render: " . $SourceFile
        );
    }

    file_put_contents(
        $DestinationFile,
        $Contents
    );
}

function GeneratePlantImageManifest(
    string $RootDirectory,
    string $OutputDirectory
): void {
    $PlantsDirectory =
        $RootDirectory .
        "/Assets/Img/Garden/Plants";

    $Manifest = [];

    if (!is_dir($PlantsDirectory)) {
        return;
    }

    foreach (
        new DirectoryIterator(
            $PlantsDirectory
        )
        as $PlantDirectory
    ) {
        if (
            $PlantDirectory->isDot() ||
            !$PlantDirectory->isDir()
        ) {
            continue;
        }

        $PlantName =
            $PlantDirectory->getFilename();

        $Manifest[$PlantName] = [];


        foreach (
            new DirectoryIterator(
                $PlantDirectory->getPathname()
            )
            as $VariantDirectory
        ) {
            if (
                $VariantDirectory->isDot() ||
                !$VariantDirectory->isDir()
            ) {
                continue;
            }

            $VariantName =
                $VariantDirectory->getFilename();

            $Images = [];


            foreach (
                new DirectoryIterator(
                    $VariantDirectory->getPathname()
                )
                as $Image
            ) {
                if (!$Image->isFile()) {
                    continue;
                }

                if (
                    preg_match(
                        "/^([0-9]+)\.png$/i",
                        $Image->getFilename(),
                        $Matches
                    ) !== 1
                ) {
                    continue;
                }

                $ImageNumber =
                    (int) $Matches[1];

                if ($ImageNumber < 1) {
                    continue;
                }

                $Images[$ImageNumber] =
                    "/Assets/Img/Garden/Plants/" .
                    $PlantName .
                    "/" .
                    $VariantName .
                    "/" .
                    $Image->getFilename();
            }


            /*
             * Sort numerically:
             *
             * 1.png
             * 2.png
             * ...
             * 10.png
             *
             * instead of:
             *
             * 1.png
             * 10.png
             * 2.png
             */

            ksort(
                $Images,
                SORT_NUMERIC
            );


            /*
             * Require consecutive numbering.
             */

            $ExpectedNumber = 1;

            foreach (
                array_keys($Images)
                as $ImageNumber
            ) {
                if (
                    $ImageNumber !==
                    $ExpectedNumber
                ) {
                    throw new RuntimeException(
                        "Missing plant image " .
                        $ExpectedNumber .
                        ".png in " .
                        $PlantName .
                        "/" .
                        $VariantName
                    );
                }

                $ExpectedNumber++;
            }


            if (count($Images) === 0) {
                continue;
            }

            $Manifest[
                $PlantName
            ][
                $VariantName
            ] = array_values(
                $Images
            );
        }


        if (
            count(
                $Manifest[$PlantName]
            ) === 0
        ) {
            unset(
                $Manifest[$PlantName]
            );
        } else {
            ksort(
                $Manifest[$PlantName],
                SORT_NATURAL |
                SORT_FLAG_CASE
            );
        }
    }


    ksort(
        $Manifest,
        SORT_NATURAL |
        SORT_FLAG_CASE
    );


    $ManifestDirectory =
        $OutputDirectory .
        "/Scripts/Garden";

    if (!is_dir($ManifestDirectory)) {
        mkdir(
            $ManifestDirectory,
            0777,
            true
        );
    }


    $Json = json_encode(
        $Manifest,
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE |
        JSON_THROW_ON_ERROR
    );


    file_put_contents(
        $ManifestDirectory .
        "/PlantImages.js",

        "const PlantImages = " .
        $Json .
        ";" .
        PHP_EOL
    );


    echo
        "Generated Scripts/Garden/PlantImages.js" .
        PHP_EOL;
}

/*
 * Remove the previous build.
 */

RemoveDirectory($OutputDirectory);

mkdir(
    $OutputDirectory,
    0777,
    true
);


/*
 * Copy static directories.
 */

$StaticDirectories = [
    "Assets",
    "Scripts",
    "Styles"
];

foreach ($StaticDirectories as $Directory) {
    CopyDirectory(
        $RootDirectory . "/" . $Directory,
        $OutputDirectory . "/" . $Directory
    );
}

GeneratePlantImageManifest(
    $RootDirectory,
    $OutputDirectory
);

/*
 * Copy index.html.
 */

 RenderPage(
     $RootDirectory . "/Pages/Home.php",
     $OutputDirectory . "/index.html",
     "./"
 );

/*
 * Build PHP pages.
 */

$Iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator(
        $PagesDirectory,
        FilesystemIterator::SKIP_DOTS
    )
);

foreach ($Iterator as $File) {
    if (!$File->isFile()) {
        continue;
    }

    if (strtolower($File->getExtension()) !== "php") {
        continue;
    }

    $SourceFile = $File->getPathname();

    $RelativePath = substr(
        $SourceFile,
        strlen($PagesDirectory) + 1
    );

    $RelativePath = str_replace(
        DIRECTORY_SEPARATOR,
        "/",
        $RelativePath
    );

    /*
     * Anything under Pages/Bits is a partial.
     * Do not generate HTML pages from these.
     */

    if (str_starts_with($RelativePath, "Bits/")) {
        continue;
    }

    $OutputPath = preg_replace(
        "/\.php$/i",
        ".html",
        $RelativePath
    );

    if ($OutputPath === null) {
        throw new RuntimeException(
            "Failed to create output path for: " . $SourceFile
        );
    }

    /*
     * Pages/Home.html
     *     RootPath = ../
     *
     * Pages/Stuff/Page.html
     *     RootPath = ../../
     */

    $Depth = substr_count(
        $OutputPath,
        "/"
    ) + 1;

    $RootPath = str_repeat(
        "../",
        $Depth
    );

    $DestinationFile =
        $OutputDirectory .
        "/Pages/" .
        $OutputPath;

    echo "Building Pages/" . $OutputPath . PHP_EOL;

    RenderPage(
        $SourceFile,
        $DestinationFile,
        $RootPath
    );
}


echo "Build complete." . PHP_EOL;
