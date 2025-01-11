"use strict";

class Element {
  constructor(tag) {
    this.el = document.createElement(tag);
  }

  clazz(cls) {
    this.el.classList.add(cls);
    return this;
  }

  value(v) {
    this.el.innerText = v;
    return this;
  }

  get e() {
    return this.el;
  }
}

class Renderer {
  constructor() {
    this.content = document.querySelector("#content");
  }

  renderBlank() {
    const displayElement = new Element("div").value("No secrets");
    this.content.appendChild(displayElement.e);
  }

  renderPage(siteList) {
    if (!siteList || siteList.length == 0) {
      this.renderBlank();
      return;
    }
    siteList.forEach((siteData) => {
      const siteElement = new Element("div").clazz("site");
      const urlElement = new Element("div").clazz("url").value(siteData.url);
      siteElement.e.appendChild(urlElement.e);
      siteData.secrets.forEach((secret) => {
        const secretElement = new Element("div")
          .clazz("secret")
          .value(secret.username);
        secretElement.e.addEventListener("drag", () => {
          navigator.clipboard.writeText(secret.password);
        });
        siteElement.e.appendChild(secretElement.e);
      });
      this.content.appendChild(siteElement.e);
    });
  }
}

class Popup {
  constructor(renderer) {
    this.renderer = renderer;
  }

  getCurrentTab = async () => {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  };

  getSiteList = async (url) => {
    const path = await chrome.runtime.getURL("secrets.json");
    const resp = await fetch(path);
    const queryData = await resp.json();
    let result = [];
    queryData.forEach((q) => {
      if (url.endsWith(q.url)) {
        result.push(q);
      }
    });
    return result;
  };

  loadContent = async () => {
    const tab = await this.getCurrentTab();
    if (!tab) {
      this.renderer.renderBlank();
      return;
    }
    const url = new URL(tab.url);
    const siteList = await this.getSiteList(url.origin);
    this.renderer.renderPage(siteList);
  };
}

const renderer = new Renderer();
const popup = new Popup(renderer);

document.addEventListener("DOMContentLoaded", popup.loadContent);
