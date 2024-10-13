/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

// ダイアログ実装参考
// https://qiita.com/Revocraft/items/583e8106af5f63217988

/**
 * ダイアログボックスプロパティ
 * @type {Object} DialogBoxProps
 * @property {boolean} isOpen ダイアログボックスオープン（表示）状態
 * @property {void} onCancel キャンセルボタンハンドラ
 * @property {void} onOK OKボタンハンドラ
 * @property {string} textTile タイトル文字列
 * @property {string} textBody 本文文字列
 */
export type DialogBoxProps = {
  isOpen: boolean;
  onCancel: () => void;
  onOK: () => void;
  textTitle: string;
  textBody: string;
};

/**
 * ダイアログボックスState
 * @property {boolean} isOpen ダイアログボックスオープン（表示）状態
 * @property {string} textTitle タイトル文字列
 * @property {string} textBody 本文文字列
 */
export type DialogBoxState = {
  isOpen: boolean;
  textTitle: string;
  textBody: string;
};

/**
 * ダイアログボックスUIコンポーネント
 * @param props ダイアログボックスプロパティ
 * @returns ダイアログボックスUIのJSX
 */
const DialogBox = (props: DialogBoxProps) => {
  return props.isOpen ? (
    <>
      {/* ダイアログボックス内 */}
      <div className="
        bg-[#FFFFDD]
        border-2 border-black
        top-1/2 left-1/2
        transform -translate-x-1/2 -translate-y-1/2
        w-100 h-60 p-5
        rounded
        flex flex-col items-start
        absolute z-20
        "
      >
        {/* タイトル */}
        <h1 className="text-xl font-bold mb-5">{props.textTitle}</h1>
        {/* 本文 */}
        <p className="mb-5">{props.textBody}</p>
        <div className="flex mt-auto w-full">
          {/* OKボタン */}
          <button className="
            bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
            text-black
            shadow shadow-black font-bold p-1 rounded border-2 border-black
            px-8 py-2 mx-auto
            "
            onClick={() => props.onOK()}
          >
            OK
          </button>
        </div>
      </div>
      {/* ダイアログボックス外側を半透過背景としキャンセルボタン相当とする */}
      <div className="
        fixed top-0 left-0
        bg-black bg-opacity-50
        w-full h-full
        z-10
        "
        onClick={() => props.onCancel()}
      >
      </div>
    </>
  ) : (  // isOpen:false　ダイアログボックス非表示
    <></>
  )
};

export default DialogBox;
