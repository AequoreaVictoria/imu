/* These are used for generating files by the 'new' task.
 */

// Prepended to all 'client-release' built pages.
function getLicenseHTML() {
    const date = new Date();
    const year = date.getFullYear();

    return `\
<!--
 * Copyright (c) ${year} Someone [UNLICENSED]
 *
 * Using
 * Normalize.css [MIT License] Copyright (c) Nicolas Gallagher
 *                             Copyright (c) Jonathan Neal
 * SUIT CSS      [MIT License] Copyright (c) Nicolas Gallagher:
 * Tailwind CSS  [MIT License] Copyright (c) Adam Wathan
 *                             Copyright (c) Jonathan Reinink
 * Stage0        [MIT License] Copyright (c) Pavel Martynov
 * S.js, S-array [MIT License] Copyright (c) Adam Haile
 *
 * Licenses:
 * [MIT License]
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
//-->
`;
}

// The actual DOM HTML that the page is built into.
function getRootHTML(page) {
    return `\
<!DOCTYPE html>
<html lang="en" data-framework="es6">
<head>
    <title>${page}</title>
    <link rel=icon href="/favicon.ico"/>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <!-- @inject "css" //-->
</head>
<body>
<svg class="hidden">
    <!-- Import @svg files here... //-->
</svg>
<noscript>
    <section>
        <h1>JavaScript Required</h1>
        <h3>Sorry, you'll need to enable JavaScript to use this site.</h3>
    </section>
</noscript>
<!-- @inject "js" //-->
</body>
</html>
`;
}

// Built and injected into '<!-- @inject "css" -->'.
function getRootCSS(base) {
    return `\
@import "${base}";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
`;
}

// style/base
function getBaseCSS() {
    return `\
@import "tailwindcss/base";

/* imu overides
 */

/* Users are expected to remember to restore similar effects!
 */
a:focus, a:hover, a:active,
input:focus, input:hover, input:active,
button:focus, button:hover, button:active {
    outline: 0;
}

/* Eric Meyer's reset, edited down to suit.
 */
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
    margin: 0;
    padding: 0;
}
`;
}

// Built and injected into '<!-- @inject "js" -->'.
function getRootJS(page) {
    return `\
import h from "stage0";
import S from "s-js/dist/es/S";
import SArray from "s-array/es";
import reconcile from "stage0/reconcile";

const View = h\`
<section #${page}>

</section>
\`;

const {${page}} = View.collect(View);

document.body.appendChild(View);
`;
}

function getComponentJS(page) {
    return `\
import h from "stage0";
import S from "s-js/dist/es/S";

const View = h\`
<div #${page.toLowerCase()}>

</div>
\`;

export default function Component(${page.toLowerCase()}) {
    const root = View.cloneNode(true);
    const {${page.toLowerCase()}} = View.collect(root);

    return root;
}
`;
}

function getSQLRoot(name) {
    return `\
DROP DATABASE IF EXISTS ${name};
CREATE DATABASE ${name}
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ${name};

`;
}

function getSQLTable(name) {
    return `\
CREATE TABLE \`${name}\` (

);
`;
}

function getServerProj(name) {
    return `\
<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
    <TargetFramework>netcoreapp2.1</TargetFramework>
    <RuntimeFrameworkVersion>2.1.1</RuntimeFrameworkVersion>
    <StartupObject>${name}.Program</StartupObject>
    <Version>1.0.0</Version>
    <NoWarn>NU1701</NoWarn>
    </PropertyGroup>
    <ItemGroup>
    <EmbeddedResource Include="mysql\\patches\\*.sql" />
    </ItemGroup>
    <ItemGroup>
    <PackageReference Include="Dapper" Version="1.60.6" />
    <PackageReference Include="Dapper.Contrib" Version="1.60.1" />
    <PackageReference Include="FluentValidation" Version="8.2.2" />
    <PackageReference Include="ini-parser" Version="2.5.2" />
    <PackageReference Include="jose-jwt" Version="2.4.0" />
    <PackageReference Include="Microsoft.AspNetCore.App" Version="2.1.1" />
    <PackageReference Include="MySql.Data" Version="8.0.15" />
    <PackageReference Include="Nancy" Version="2.0.0-clinteastwood" />
    <PackageReference Include="Nancy.Authentication.Stateless" Version="2.0.0-clinteastwood" />
    <PackageReference Include="Nancy.Serialization.JsonNet" Version="2.0.0-clinteastwood" />
    <PackageReference Include="Nancy.Validation.FluentValidation" Version="2.0.0-clinteastwood" />
    <PackageReference Include="Scrypt.NET" Version="1.3.0" />
    </ItemGroup>
    <ItemGroup>
    <Folder Include="mysql\\patches" />
    </ItemGroup>
</Project>
`;
}

function getServerINI(name) {
    return `\
[App]
AppVer = 1.0.0
ToolVer = 1

[MySql]
Host = 127.0.0.1
Username = ${name}
Password = ${name}
Database = ${name}

`;
}

module.exports = {
    getLicenseHTML,
    getRootHTML,
    getRootCSS,
    getBaseCSS,
    getRootJS,
    getComponentJS,
    getSQLRoot,
    getSQLTable,
    getServerProj,
    getServerINI
};
