{
  "targets": [{
    "target_name": "synapta_x2j",
    "include_dirs" : [
      "src",
      "<!(node -e \"require('nan')\")"
    ],
    "sources": [
      "src/xml2json.cpp",
      "src/library.cpp",
      "src/FileInterface.cpp",
      "src/StringInterface.cpp"
    ]
  }]
}