let popup = document.getElementById("popup-ymm-search-tool");

class PopupYMMSearchTool extends PopupComponent {
  constructor() {
    super();
    let generateButton = this.querySelector(".js-generate-json-buttton");
    let input = this.querySelector("input");

    input.addEventListener("change", this.handleFile.bind(this), false);
  }

  handleFile(e) {
    var results = [];
    var files = e.target.files,
      f = files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: "array" });
      workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        if (roa.length < 2) return;
        let header = roa[0];
        roa.slice(1).forEach((item, index) => {
          let [collection, tag1, tag2] = item;

          if (!collection || !tag1 || !tag2) {
            return;
          }
          if (results.length) {
            let existCollection = results.find((fieldCollection) => {
              if (fieldCollection.name == collection) {
                let existTag1 = fieldCollection.field_2.find((fieldTag1) => {
                  if (fieldTag1.name == tag1) {
                    let existTag1 = fieldTag1.field_3.includes(tag2);

                    if (!existTag1) {
                      fieldTag1.field_3.push(tag2);
                    }
                    return true;
                  }
                  return false;
                });
                if (!existTag1) {
                  fieldCollection.field_2.push({ name: tag1, field_3: [tag2] });
                }

                return true;
              }
              return false;
            });
            if (!existCollection) {
              results.push({ name: collection, field_2: [{ name: tag1, field_3: [tag2] }] });
            }
          } else {
            results.push({ name: collection, field_2: [{ name: tag1, field_3: [tag2] }] });
          }
        });
      });
      // see the result, caution: it works after reader event is done.
      const a = document.createElement("a");
      const file = new Blob([JSON.stringify(results)], { type: "text/plain" });

      a.href = URL.createObjectURL(file);
      a.download = "data.json";
      a.click();

      URL.revokeObjectURL(a.href);
    };
    reader.readAsArrayBuffer(f);
  }
}

customElements.define("popup-ymm-search-tool", PopupYMMSearchTool);
popup.open();
