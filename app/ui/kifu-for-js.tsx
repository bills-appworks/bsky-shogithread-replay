/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

import { KifuLite } from 'kifu-for-js';
import { KifuStoreState } from '@/app/lib/common';

const KifuForJS = ({ kifuStoreState }: { kifuStoreState: KifuStoreState }) => {
  return (
    <div className="
      [&_button]:rounded [&_button]:border [&_button]:border-gray-500
      [&_button]:bg-[#FFE581] hover:[&_button]:bg-[#EFD571] active:[&_button]:bg-[#DFC561]
      [&_div[aria-label]]:!bg-[#FFFFDD] 
    ">
      <KifuLite
        kifuStore={ kifuStoreState.kifuStore }
        style={{
          border: "1px black solid",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          margin: "auto",
        }}
      />
    </div>
  );
}

export default KifuForJS;
