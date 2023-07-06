let button = document.getElementById("pdfButton");
      button.addEventListener("click", function () {
         let doc = new jsPDF("p", "mm", [300, 300]);
         let makePDF = document.querySelector("#section");
         // fromHTML Method
         doc.fromHTML(makePDF);
         doc.save("output.pdf");
      });