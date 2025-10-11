<?php

/*
 * You can place your custom package configuration in here.
 */
return [
    "presets" => [
        "default" => [
            "editorType" => "classic",
            "cloud" => [
                "editorVersion" => "47.0.0",
                "premium" => false,
                "translations" => ["en"],
            ],
            "config" => [
                "toolbar" => [
                    "items" => [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "|",
                        "outdent",
                        "indent",
                        "|",
                        "blockQuote",
                        "insertTable",
                        "undo",
                        "redo",
                    ],
                ],
                "language" => "en",
                "table" => [
                    "contentToolbar" => [
                        "tableColumn",
                        "tableRow",
                        "mergeTableCells",
                    ],
                ],
            ],
        ],
    ],
];
