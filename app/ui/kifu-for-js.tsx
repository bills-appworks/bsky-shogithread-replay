import { KifuLite } from 'kifu-for-js';
import { KifuStoreState } from '@/app/lib/common';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';

const KifuForJS = ({ kifuStoreState }: { kifuStoreState: KifuStoreState }) => {
    return (
    <KifuLite
      kifuStore={ kifuStoreState.kifuStore }
      style={{
        border: "1px black solid",
        backgroundColor: "rgba(255, 255, 255, 0.2)"
      }}
    />
  );
}

export default KifuForJS;
