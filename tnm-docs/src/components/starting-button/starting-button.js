"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartingButton = void 0;
var Heading_1 = require("@theme/Heading");
var clsx_1 = require("clsx");
var button_module_css_1 = require("./button.module.css");
var Link_1 = require("@docusaurus/Link");
var StartingButton = function (_a) {
    var description = _a.description, title = _a.title, url = _a.url;
    return (<div className={(0, clsx_1.default)("col col--5")}>
      <div className="text--center padding-vert--lg">
        <Heading_1.default as="h3">{title}</Heading_1.default>
        <p>{description}</p>
        <div className={button_module_css_1.default.button}>
          <Link_1.default className="button button--secondary button--lg" to={url}>
            Go
          </Link_1.default>
        </div>
      </div>
    </div>);
};
exports.StartingButton = StartingButton;
