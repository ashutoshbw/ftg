const txtArea = document.querySelector("#inputText");
const headingCon = document.querySelector("#heading-container");
const tocCon = document.querySelector("#toc-container");
const copyBtnSVG = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon d-inline-block">
    <path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
</svg>`;

txtArea.setSelectionRange(txtArea.value.length, txtArea.value.length);

// Parameter controllers below
let hNumColor = `#66a62e`;
let anchorColor = `#d03434`;
let anchorText = `#`;
let italicNumStyle = true;

const getNumStyle = () => {
  return `margin-right: 8px; color: ${hNumColor}; font-weight: bold; font-style: ${italicNumStyle ? "italic" : "normal"}`;
}

let spanNumberStyle = getNumStyle();

const hNumColorPicker = document.querySelector("#cp-h-num");
const anchorColorPicker = document.querySelector("#cp-anchor");
const anchorSelect = document.querySelector("#anchor-select");
const numStyleCheckbox = document.querySelector("#num-style");

hNumColorPicker.value = hNumColor;
anchorColorPicker.value = anchorColor;

hNumColorPicker.addEventListener("input", (e) => {
  hNumColor = e.target.value;
  spanNumberStyle = getNumStyle();
  handleMarkdownText();
});

anchorColorPicker.addEventListener("input", (e) => {
  anchorColor = e.target.value;
  handleMarkdownText();
});

anchorSelect.addEventListener("input", (e) => {
  anchorText = e.target.value;
  handleMarkdownText();
});

numStyleCheckbox.addEventListener("input", (e) => {
  italicNumStyle = e.target.checked;
  spanNumberStyle = getNumStyle();
  handleMarkdownText();
});

function elt(type, id, className) {
  const node = document.createElement(type);
  if (id) node.id = id;
  if (className) node.className = className;
  return node;
}

function getSubHeadings(headings, i) {
  const parentLevel = +headings[i].tagName[1]; 
  const subHeadings = [];
  for (let j = i + 1; j < headings.length; j++) {
    const h = headings[j];
    const level = +headings[j].tagName[1]; 
    if (level > parentLevel) {
      subHeadings.push(h);
    } else {
      break;
    }
  }
  return subHeadings;
}

function genToc(headings, firstTime) {
  const ul = elt("ul");

  for (let i = 0; i < headings.length; i++) {
    const li = elt("li");
    li.innerHTML = `<a href="#${headings[i].id}">${headings[i].innerHTML}</a>`;
    li.querySelector("a").hLevel = +headings[i].tagName[1];
//    console.log(li.querySelector("a").hLevel);
    const subHeadings = getSubHeadings(headings, i);
    i = i + subHeadings.length;
    if (subHeadings.length > 0) {
      li.append(genToc(subHeadings, false));
    }
    ul.append(li);
  }

  if (firstTime) {
    const toc = elt("div", undefined, "toc");
    const h2 = elt("h2");

    h2.textContent = "Table of contents";
    toc.append(h2);
    toc.append(ul);

    return toc;
  } else {
    return ul;
  }
}

function walkAlongToc(ul, parentLoc = []) {
  const liArr = ul.querySelectorAll(":scope > li");

  for (let i = 0; i < liArr.length; i++) {
    const li = liArr[i];
    const a = li.querySelector("a");

    const innerUl = li.querySelector("ul");

    const span1 = document.createElement("span");
    span1.className = "toc-item-number";
    span1.textContent = [...parentLoc, i + 1].join(".");
    a.insertAdjacentElement("beforeBegin", span1);

    if (innerUl) {
      parentLoc.push(i + 1);
      walkAlongToc(innerUl, parentLoc);
      parentLoc.pop();
    } 
  }
}

function addStyle(elements, style) {
  for (let e of elements) {
     e.style = style;
  }
}

function addInlineStyles() {
  let toc = document.querySelectorAll(".toc");
  let ul = document.querySelectorAll(".toc ul");
  let lis = document.querySelectorAll(".toc li");
  let h2 = document.querySelectorAll(".toc h2");
  let h2ul = document.querySelectorAll(".toc h2 + ul");
  let ulul = document.querySelectorAll(".toc ul ul");
  let toc_item_number = document.querySelectorAll(".toc-item-number");
  let h_item_number = document.querySelectorAll(".h-item-number");



  addStyle(toc, `margin-bottom: 20px; font-size: 19px; font-family: 'Lato', sans-serif;`);
  addStyle(ul, `list-style-type: none; margin: 0;`);
  addStyle(lis, `margin-iline: 0; margin-block: 2px; padding: 0; `);
  addStyle(h2, `margin-bottom: 0; margin-top: 20px; font-weight: normal; line-height: 50px`);
  addStyle(h2ul, `padding-left: 10px; padding-block: 8px; margin-top: 0; list-style-type: none; margin: 0; border-block: 1px solid gray;`);
  addStyle(toc_item_number, spanNumberStyle);
  addStyle(h_item_number, spanNumberStyle);
}

function removeClasses() {
  let all = document.querySelectorAll(".toc, .toc *");
  for (let e of all) {
    if (e.hasAttribute("class")) {
      e.removeAttribute("class");
    }
  }
}

function getCopyBtn(text, isItForToc) {
  const copyBtn = elt("button", null, "copy-btn");

  copyBtn.innerHTML = copyBtnSVG;

  tippy(copyBtn, {
    trigger: "click",
    content: 'Copied!',
    hideOnClick: false,
    onShow(instance) {
      setTimeout(() => {
        instance.hide();
      }, 800);
    }
  });

  copyBtn.addEventListener("click", (e) => {
    const textWithComment = `<!--
Generator: https://ftm.github.io/

${inputText.value.trim()}
-->
${text}
`;
    if (isItForToc) {
      navigator.clipboard.writeText(textWithComment);
    } else {
      navigator.clipboard.writeText(text);
    }

    copyBtn.textContent = "✓";

    setTimeout(() => {
      copyBtn.innerHTML = copyBtnSVG;
    }, 800)
  });

  return copyBtn;
}

function makeHeadings(toc) {
  let div = elt("div");

  const tUl = toc.querySelector(":scope ul");
  const a = tUl.querySelectorAll("a");
  const spans = tUl.querySelectorAll("span");


  for (let i = 0; i < a.length; i++) {
    const h = document.createElement("h" + a[i].hLevel);
    const anchor = document.createElement("a");

    let href = a[i].getAttribute("href");
    anchor.href = href;
    anchor.textContent = anchorText;
    anchor.style = `color: ${anchorColor}; padding-left: 8px; text-decoration: none;`;
    anchor.setAttribute("aria-label", `Anchor link for: "${a[i].textContent}"`);
    h.id = [...href].slice(1).join('');

    const span = spans[i].cloneNode(true);
    span.className = "h-item-number";
    h.append(span);
    h.append(...a[i].childNodes);
    h.append(anchor);

    const hItem = elt("div", null, "h-item");

    let h_item_number = h.querySelectorAll(".h-item-number");
    addStyle(h_item_number, spanNumberStyle);

    span.removeAttribute("class");

    const copyBtn = getCopyBtn(h.outerHTML);

    hItem.append(copyBtn);
    hItem.append(h);

    div.append(hItem);
  }
  return div;
}

function addProperTocPadding(toc) {
  const tocSubUls = [...toc.querySelectorAll("ul")];

  for (let i = 0; i < tocSubUls.length; i++) {
    const ul = tocSubUls[i];
    const preCounter = ul.parentElement.querySelector(".toc-item-number")
    const w = preCounter.getBoundingClientRect().width;
    const m = +getComputedStyle(preCounter).marginRight.replace("px", "");
    ul.style.paddingLeft = (w + m) + "px"; 
  }
}

showdown.setOption('ghCompatibleHeaderId', true);
var converter = new showdown.Converter();

function handleMarkdownText() {
  const dummyDiv = elt("div");
  dummyDiv.innerHTML = converter.makeHtml(txtArea.value);

  const headings = [...dummyDiv.childNodes].filter(node => {
    if (node.nodeType == 3) return false;
    if (["H1", "H2", "H3", "H4", "H5", "H6"].some(tagName => node.tagName == tagName)) {
      return true;
    } else {
      return false;
    }
  });

  const toc = genToc(headings, true);

  tocUl = toc.querySelector("ul");
  walkAlongToc(tocUl);

  tocCon.innerHTML = toc.outerHTML;

  const headingsContainer = makeHeadings(toc);
  headingCon.innerHTML = "";
  headingCon.append(...headingsContainer.childNodes)

  addInlineStyles();

  addProperTocPadding(tocCon.querySelector(".toc ul"));
  removeClasses();

  const copyBtn = getCopyBtn(tocCon.innerHTML, true);
  copyBtn.classList.add("toc-copy-btn");
  tocCon.querySelector("h2").insertAdjacentElement("beforeend", copyBtn);
}

txtArea.addEventListener("input", handleMarkdownText);

handleMarkdownText();

// On first render Chrome unfortunately doesn't calculate the paddings of TOC
// 100% accurately. If a little bit later a 2nd render happens, the paddings are
// then corrected. 
setTimeout(handleMarkdownText, 100);

