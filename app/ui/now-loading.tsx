/**
 * @author bills-appworks
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

export type NowLoadingProps = {
  isOpen: boolean;
  textTitle: string;
  textBody: string;
};

export type NowLoadingState = {
  isOpen: boolean;
  textTitle: string;
  textBody: string;
};

const NowLoading = (props: NowLoadingProps) => {
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
      </div>
      <div className="
        fixed top-0 left-0
        bg-black bg-opacity-50
        w-full h-full
        z-10
        "
      >
      </div>
    </>
  ) : (
    <></>
  )
};

export default NowLoading;
