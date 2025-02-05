/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

/**
 * プライバシーポリシー部分UIコンポーネント
 * @returns プライバシーポリシー部分UIのJSX
 */
export default function PrivacyPolicy() {
  return (
    <div className="border border-black text-sm mt-2 p-1">
      <h2>[プライバシーポリシー / Privacy policy]</h2>
      <div>
        <div>当アプリケーションでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。</div>
        <div>このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。 このトラフィックデータは匿名で収集されており、個人を特定するものではありません。 この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。</div>
      </div>
      <div>
        <div>This application using “Google Analytics” for access analytics tool by Google LLC.</div>
        <div>Google Analytics using cookie for collect traffic data. This traffic data collect by anonymous and do not identify to individual. This function can reject by disable cookie, please confirm your web browser settings.</div>
      </div>
    </div>
  );
}