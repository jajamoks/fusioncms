(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{WjD0:function(t,e){t.exports="object"==typeof self?self.FormData:window.FormData},owoO:function(t,e,n){"use strict";n.r(e);var a=n("WjD0"),s=n.n(a),o={data:function(){return{section:{},settings:{},groups:{}}},methods:{mapOptions:function(t){var e=[];for(var n in t)t.hasOwnProperty(n)&&e.push({label:t[n],value:n});return e},submit:function(){var t=this,e=new s.a;e.append("_method","PATCH"),_.forEach(this.settings,function(t){e.append(t.handle,t.value)}),axios.post("/api/settings/".concat(this.section.handle),e).then(function(){toast("Settings have been updated.","success"),t.$router.push("/settings")})}},beforeRouteEnter:function(t,e,n){axios.get("/api/settings/"+t.params.section).then(function(t){n(function(e){var n=_.filter(t.data.data.items,function(t){return!0===t.gui});e.section=t.data.data.section,e.groups=_.groupBy(n,"group"),e.settings=n})})}},i=n("KHd+"),r=Object(i.a)(o,function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("portal",{attrs:{to:"title"}},[n("app-title",{attrs:{icon:"cog"}},[t._v(t._s(t.section.name)+" Settings")])],1),t._v(" "),n("div",{staticClass:"row"},[n("div",{staticClass:"content-container"},[n("form",{attrs:{enctype:"multipart/form-data"},on:{submit:function(e){return e.preventDefault(),t.submit(e)}}},[n("div",{staticClass:"col w-full xl:w-2/3 mx-auto"},[n("p-tabs",t._l(t.groups,function(e,a,s){return n("p-tab",{key:a,attrs:{name:a,active:0===s}},t._l(e,function(e){return n("div",{key:e.handle,staticClass:"form__group"},["text"===e.type||"number"===e.type||"email"===e.type?n("p-input",{ref:e.handle,refInFor:!0,attrs:{name:e.handle,label:e.name,type:e.type,help:e.description},model:{value:e.value,callback:function(n){t.$set(e,"value",n)},expression:"setting.value"}}):t._e(),t._v(" "),"select"===e.type?n("p-select",{ref:e.handle,refInFor:!0,attrs:{name:e.handle,label:e.name,options:t.mapOptions(e.options),help:e.description},model:{value:e.value,callback:function(n){t.$set(e,"value",n)},expression:"setting.value"}}):t._e(),t._v(" "),"file"===e.type?n("p-upload",{attrs:{name:e.handle,label:e.name,help:e.description,accept:"json"},model:{value:e.value,callback:function(n){t.$set(e,"value",n)},expression:"setting.value"}}):t._e()],1)}),0)}),1)],1),t._v(" "),n("portal",{attrs:{to:"actions"}},[n("router-link",{staticClass:"button mr-3",attrs:{to:{name:"settings"}}},[t._v("Cancel")]),t._v(" "),n("button",{staticClass:"button button--primary",attrs:{type:"submit"},on:{click:function(e){return e.preventDefault(),t.submit(e)}}},[t._v("Save Settings")])],1)],1)])])],1)},[],!1,null,null,null);e.default=r.exports}}]);