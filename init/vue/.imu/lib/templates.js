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
 * Vue.js        [MIT License] Copyright (c) Evan You
 * VueRouter.js  [MIT License] Copyright (c) Evan You
 * Vuex.js       [MIT License] Copyright (c) Evan You
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
<div id="root"></div>
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
import Vue from "vue/dist/vue.runtime.esm";
import VueRouter from "vue-router/dist/vue-router.esm";

Vue.use(VueRouter);

var router = new VueRouter({
    mode: "history",
    linkActiveClass: "is-active",
    base: "/",
    routes: [
        // {name: "Default", path: "/", component: Default},
    ]
});

new Vue({
    el: "#root",
    render,
    staticRenderFns,
    router
});
`;
}

function getComponentJS(page) {
    return `\
import Vue from "vue/dist/vue.runtime.esm";

// @vue "curator/components/${page.toLowerCase()}"

var App = Vue.component("${page}", {render, staticRenderFns});

export default App;
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
﻿<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
      <TargetFramework>netcoreapp3.0</TargetFramework>
      <StartupObject>${name}.Program</StartupObject>
      <Version>1.0.0</Version>
      <NoWarn>NU1602,NU1701</NoWarn>
    </PropertyGroup>
    <ItemGroup>
        <EmbeddedResource Include="mysql\patches\*.sql" />
    </ItemGroup>
    <ItemGroup>
        <PackageReference Include="Carter" Version="4.2.0" />
        <PackageReference Include="Dapper" Version="1.60.6" />
        <PackageReference Include="Dapper.Contrib" Version="1.60.1" />
        <PackageReference Include="FluentValidation" Version="8.5.0-preview4" />
        <PackageReference Include="GracefullShutdown" Version="1.0.3" />
        <PackageReference Include="jose-jwt" Version="2.4.0" />
        <PackageReference Include="Microsoft.Extensions.Configuration.EnvironmentVariables" Version="3.0.0-preview7.19362.4" />
        <PackageReference Include="Microsoft.Extensions.Configuration.Json" Version="3.0.0-preview7.19362.4" />
        <PackageReference Include="Microsoft.Extensions.Options.ConfigurationExtensions" Version="3.0.0-preview7.19362.4" />
        <PackageReference Include="MySql.Data" Version="8.0.17" />
        <PackageReference Include="SparkPost" Version="1.14.0" />
    </ItemGroup>
    <ItemGroup>
        <Folder Include="mysql\patches" />
    </ItemGroup>
</Project>
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
    getServerProj
};
