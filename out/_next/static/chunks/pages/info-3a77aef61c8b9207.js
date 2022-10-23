(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[776],{34137:function(e,t,n){"use strict";var r=n(53566),a=n(28598);t.Z=(0,r.Z)((0,a.jsx)("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"}),"Edit")},57867:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(53778).Z;Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n=u.default,i=(null==t?void 0:t.suspense)?{}:{loading:function(e){e.error,e.isLoading;return e.pastDelay,null}};r(e,Promise)?i.loader=function(){return e}:"function"===typeof e?i.loader=e:"object"===typeof e&&(i=a({},i,e));!1;(i=a({},i,t)).suspense&&(delete i.ssr,delete i.loading);i.loadableGenerated&&delete(i=a({},i,i.loadableGenerated)).loadableGenerated;if("boolean"===typeof i.ssr&&!i.suspense){if(!i.ssr)return delete i.ssr,o(n,i);delete i.ssr}return n(i)},t.noSSR=o;var a=n(54363).Z,i=n(4858).Z,u=(i(n(82684)),i(n(8450)));function o(e,t){return delete t.webpack,delete t.modules,e(t)}("function"===typeof t.default||"object"===typeof t.default&&null!==t.default)&&"undefined"===typeof t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},18546:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.LoadableContext=void 0;var r=(0,n(4858).Z)(n(82684)).default.createContext(null);t.LoadableContext=r},8450:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(13749).Z,a=n(52336).Z;Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=n(54363).Z,u=(0,n(4858).Z)(n(82684)),o=n(18546),l=n(82684).useSyncExternalStore,s=[],d=[],c=!1;function f(e){var t=e(),n={loading:!0,loaded:null,error:null};return n.promise=t.then((function(e){return n.loading=!1,n.loaded=e,e})).catch((function(e){throw n.loading=!1,n.error=e,e})),n}var h=function(){function e(t,n){r(this,e),this._loadFn=t,this._opts=n,this._callbacks=new Set,this._delay=null,this._timeout=null,this.retry()}return a(e,[{key:"promise",value:function(){return this._res.promise}},{key:"retry",value:function(){var e=this;this._clearTimeouts(),this._res=this._loadFn(this._opts.loader),this._state={pastDelay:!1,timedOut:!1};var t=this._res,n=this._opts;t.loading&&("number"===typeof n.delay&&(0===n.delay?this._state.pastDelay=!0:this._delay=setTimeout((function(){e._update({pastDelay:!0})}),n.delay)),"number"===typeof n.timeout&&(this._timeout=setTimeout((function(){e._update({timedOut:!0})}),n.timeout))),this._res.promise.then((function(){e._update({}),e._clearTimeouts()})).catch((function(t){e._update({}),e._clearTimeouts()})),this._update({})}},{key:"_update",value:function(e){this._state=i({},this._state,{error:this._res.error,loaded:this._res.loaded,loading:this._res.loading},e),this._callbacks.forEach((function(e){return e()}))}},{key:"_clearTimeouts",value:function(){clearTimeout(this._delay),clearTimeout(this._timeout)}},{key:"getCurrentValue",value:function(){return this._state}},{key:"subscribe",value:function(e){var t=this;return this._callbacks.add(e),function(){t._callbacks.delete(e)}}}]),e}();function m(e){return function(e,t){var n=function(){if(!s){var t=new h(e,a);s={getCurrentValue:t.getCurrentValue.bind(t),subscribe:t.subscribe.bind(t),retry:t.retry.bind(t),promise:t.promise.bind(t)}}return s.promise()},r=function(){n();var e=u.default.useContext(o.LoadableContext);e&&Array.isArray(a.modules)&&a.modules.forEach((function(t){e(t)}))},a=Object.assign({loader:null,loading:null,delay:200,timeout:null,webpack:null,modules:null,suspense:!1},t);a.suspense&&(a.lazy=u.default.lazy(a.loader));var s=null;if(!c){var f=a.webpack?a.webpack():a.modules;f&&d.push((function(e){var t=!0,r=!1,a=void 0;try{for(var i,u=f[Symbol.iterator]();!(t=(i=u.next()).done);t=!0){var o=i.value;if(-1!==e.indexOf(o))return n()}}catch(l){r=!0,a=l}finally{try{t||null==u.return||u.return()}finally{if(r)throw a}}}))}var m=a.suspense?function(e,t){return r(),u.default.createElement(a.lazy,i({},e,{ref:t}))}:function(e,t){r();var n=l(s.subscribe,s.getCurrentValue,s.getCurrentValue);return u.default.useImperativeHandle(t,(function(){return{retry:s.retry}}),[]),u.default.useMemo((function(){return n.loading||n.error?u.default.createElement(a.loading,{isLoading:n.loading,pastDelay:n.pastDelay,timedOut:n.timedOut,error:n.error,retry:s.retry}):n.loaded?u.default.createElement((t=n.loaded)&&t.__esModule?t.default:t,e):null;var t}),[e,n])};return m.preload=function(){return n()},m.displayName="LoadableComponent",u.default.forwardRef(m)}(f,e)}function p(e,t){for(var n=[];e.length;){var r=e.pop();n.push(r(t))}return Promise.all(n).then((function(){if(e.length)return p(e,t)}))}m.preloadAll=function(){return new Promise((function(e,t){p(s).then(e,t)}))},m.preloadReady=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];return new Promise((function(t){var n=function(){return c=!0,t()};p(d,e).then(n,n)}))},window.__NEXT_PRELOADREADY=m.preloadReady;var y=m;t.default=y},51774:function(e,t,n){e.exports=n(57867)},38300:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/info",function(){return n(2048)}])},2048:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return _}});var r=n(28598),a=n(82684),i=n(70136),u=n(97648),o=n(82015),l=n(93720),s=n(73073),d=n(41826),c=n(34137),f=(0,n(53566).Z)((0,r.jsx)("path",{d:"M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"}),"Save"),h=n(84166),m=(n(11387),n(44412),n(51774)),p=n.n(m),y=p()((function(){return n.e(460).then(n.bind(n,20460)).then((function(e){return e.default}))}),{loadableGenerated:{webpack:function(){return[20460]}},ssr:!1}),v=p()((function(){return n.e(460).then(n.bind(n,20460)).then((function(e){return e.default.Markdown}))}),{loadableGenerated:{webpack:function(){return[20460]}},ssr:!1}),_=function(){var e=(0,a.useContext)(d.f),t=(0,a.useContext)(s.St),n=t.userId,m=t.profile,p=t.family,_=t.getFamily,b=(0,a.useState)(!1),x=b[0],j=b[1],Z=(0,a.useState)(void 0),g=Z[0],k=Z[1];if(!p)return(0,r.jsx)(h.Z,{});return(0,r.jsxs)(i.Z,{maxWidth:"lg",mx:"auto",mt:2,children:[(0,r.jsx)(u.Z,{variant:"h3",mb:2,children:"Information"}),(0,r.jsx)(o.Z,{sx:{p:2,mt:3},children:(0,r.jsxs)(i.Z,{"data-color-mode":"light",children:[(0,r.jsx)(u.Z,{variant:"h4",mb:2,children:"Family Board"}),x?(0,r.jsx)(y,{value:g,onChange:k}):(0,r.jsx)(v,{style:{padding:15},source:p.boardMarkdown}),(0,r.jsxs)(i.Z,{mt:3,children:[n===p.headOfFamily&&!x&&(0,r.jsx)(l.Z,{variant:"contained",startIcon:(0,r.jsx)(c.Z,{}),onClick:function(){k(p.boardMarkdown),j(!0)},children:"Edit Board"}),n===p.headOfFamily&&x&&(0,r.jsx)(l.Z,{variant:"contained",startIcon:(0,r.jsx)(f,{}),onClick:function(){m&&(j(!1),g!==p.boardMarkdown&&e.updateFamily(m.familyId,{boardMarkdown:g}).then((function(){_(),k(void 0)})))},children:"Save Changes"})]})]})})]})}},84166:function(e,t,n){"use strict";n.d(t,{Z:function(){return x}});var r=n(28598),a=n(70136),i=n(82015),u=n(97648),o=n(80464),l=n(82561),s=n(93720),d=n(82684),c=n(40076),f=n(18567),h=n(35127),m=n(51537),p=n(84446),y=n(55402),v=n(73073),_=n(41826),b=function(e){var t=(0,d.useContext)(v.Il).setSnackbarData,n=(0,d.useContext)(_.f),a=(0,d.useContext)(v.St),i=a.userId,u=a.getProfile,o=a.getFamily,b=e.isOpen,x=e.setIsOpen,j=(0,d.useState)(void 0),Z=j[0],g=j[1];return(0,r.jsxs)(c.Z,{open:b,onClose:function(){return x(!1)},fullWidth:!0,children:[(0,r.jsx)(f.Z,{children:"Create Family"}),(0,r.jsx)(h.Z,{children:(0,r.jsx)(l.Z,{children:(0,r.jsx)(m.Z,{autoFocus:!0,variant:"standard",label:"Family (Last) Name",value:Z,onChange:function(e){return g(e.target.value)},required:!0})})}),(0,r.jsxs)(p.Z,{children:[(0,r.jsx)(s.Z,{onClick:function(){return x(!1)},children:"Cancel"}),(0,r.jsx)(s.Z,{variant:"contained",onClick:function(){if(i&&Z){var e=(0,y.Z)(),r={name:Z,headOfFamily:i,members:[i],boardMarkdown:"This is the family board!",pets:[],vehicles:[],residences:[],groceryList:[]};n.createFamily(e,r).then((function(){o(),t({msg:"Successfully created family!",severity:"success"})})),n.updateProfile(i,{familyId:e}).then((function(){u()})),x(!1)}},children:"Create"})]})]})},x=function(){var e=(0,d.useState)(!1),t=e[0],n=e[1];return(0,r.jsx)(a.Z,{maxWidth:"sm",mx:"auto",mt:3,children:(0,r.jsxs)(i.Z,{sx:{p:2},children:[(0,r.jsx)(u.Z,{variant:"h5",mb:3,children:"We couldn't find a family for this profile!"}),(0,r.jsx)(u.Z,{variant:"h6",textAlign:"center",children:"Ask your head-of-household for their family invite link"}),(0,r.jsx)(o.Z,{sx:{width:250,mx:"auto",mt:2,mb:2},children:"OR"}),(0,r.jsx)(l.Z,{direction:"row",justifyContent:"center",children:(0,r.jsx)(s.Z,{variant:"contained",onClick:function(){return n(!0)},children:"Create a family"})}),(0,r.jsx)(b,{isOpen:t,setIsOpen:n})]})})}},44412:function(){},11387:function(){}},function(e){e.O(0,[876,913,774,888,179],(function(){return t=38300,e(e.s=t);var t}));var t=e.O();_N_E=t}]);