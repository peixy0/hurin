"use strict";

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab
}

function renderEmpty() {
  const displayElement = document.createElement("div");
  displayElement.innerText = "No secrets";
  document.querySelector("#content").appendChild(displayElement);
}

function renderPage(siteList) {
  if (!siteList || siteList.length == 0) {
    renderEmpty();
    return;
  }
  siteList.forEach((siteData) => {
    const siteElement = document.createElement("div");
    siteElement.classList.add("site");
    const urlElement = document.createElement("div");
    urlElement.classList.add("url");
    urlElement.innerText = siteData.url;
    siteElement.appendChild(urlElement);
    siteData.secrets.forEach((secret) => {
      const secretElement = document.createElement("div");
      secretElement.classList.add("secret");
      secretElement.innerText = secret.username;
      secretElement.addEventListener("drag", () => {
        navigator.clipboard.writeText(secret.password);
      });
      siteElement.appendChild(secretElement);
    });
    document.querySelector("#content").appendChild(siteElement);
  });
}

async function getSiteList(url) {
  const path = await chrome.runtime.getURL("secrets.json");
  const resp = await fetch(path);
  const queryData = await resp.json();
  let result = [];
  queryData.forEach((q) => {
    const re = new RegExp(q.url);
    if (re.exec(url)) {
      result.push(q);
    }
  });
  return result;
}

async function loadContent() {
  const tab = await getCurrentTab();
  if (!tab) {
    renderEmpty();
    return;
  }
  const url = new URL(tab.url);
  const siteList = await getSiteList(url.origin);
  renderPage(siteList);
}

window.onload = loadContent;
