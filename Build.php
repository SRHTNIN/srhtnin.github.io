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
