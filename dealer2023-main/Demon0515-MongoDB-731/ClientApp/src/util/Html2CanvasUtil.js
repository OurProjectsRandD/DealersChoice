import html2canvas from "html2canvas";

export const exportAsImage = async (element, imageFileName) => {
  /* const html = document.getElementsByTagName("html")[0];
  const body = document.getElementsByTagName("body")[0];
  let htmlWidth = html.clientWidth;
  let bodyWidth = body.clientWidth;
  const newWidth = element.scrollWidth - element.clientWidth;
  if (newWidth > element.clientWidth) {
    htmlWidth += newWidth;
    bodyWidth += newWidth;
  }
  html.style.width = htmlWidth + "px";
  body.style.width = bodyWidth + "px"; */
  const canvas = await html2canvas(element);
  //document.body.appendChild(canvas);
  const image = canvas.toDataURL("image/png", 1.0);

  //window.open(`https://www.facebook.com/sharer/sharer.php?u=asdf`);

  downloadImage(image, imageFileName);
  /* html.style.width = null;
  body.style.width = null; */
};

export const downloadImage = (blob, fileName) => {
  //alert(blob);
  const fakeLink = window.document.createElement("a");
  fakeLink.style = "display:none;";
  fakeLink.download = fileName;

  fakeLink.href = blob;

  document.body.appendChild(fakeLink);
  fakeLink.click();
  document.body.removeChild(fakeLink);

  fakeLink.remove();
};
