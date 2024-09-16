import React, { useEffect } from 'react';

// 德川小助手
// const Assistant = () => {
//   useEffect(() => {
//     (function (d, t) {
//       var v = d.createElement(t),
//         s = d.getElementsByTagName(t)[0];
//       v.onload = function () {
//         window.voiceflow.chat.load({
//           verify: { projectID: '657966c09e57db431ad839e8' },
//           url: 'https://general-runtime.voiceflow.com',
//           versionID: 'production',
//         });
//       };
//       v.src = 'https://cdn.voiceflow.com/widget/bundle.mjs';
//       v.type = 'text/javascript';
//       s.parentNode.insertBefore(v, s);
//     })(document, 'script');
//   }, []);

//   return <div></div>;
// };

// 精誠小助手
const Assistant = () => {
  useEffect(() => {
    (function (d, t) {
      var v = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
      v.onload = function () {
        window.voiceflow.chat.load({
          verify: { projectID: '66e66817b678c8b729da50c6' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
        });
      };
      v.src = 'https://cdn.voiceflow.com/widget/bundle.mjs';
      v.type = 'text/javascript';
      s.parentNode.insertBefore(v, s);
    })(document, 'script');
  }, []);

  return <div></div>;
};

export default Assistant;
