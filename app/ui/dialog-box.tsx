
// ダイアログ実装参考
// https://qiita.com/Revocraft/items/583e8106af5f63217988

export type DialogBoxProps = {
  isOpen: boolean;
  onCancel: () => void;
  onOK: () => void;
  textTitle: string;
  textBody: string;
};

export type DialogBoxState = {
  isOpen: boolean;
  textTitle: string;
  textBody: string;
};

const DialogBox = (props: DialogBoxProps) => {
  return props.isOpen ? (
    <>
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
        <h1 className="text-xl font-bold mb-5">{props.textTitle}</h1>
        <p className="mb-5">{props.textBody}</p>
        <div className="flex mt-auto w-full">
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
  ) : (
    <></>
  )
};

export default DialogBox;
