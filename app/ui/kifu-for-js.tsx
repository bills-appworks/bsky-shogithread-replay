import { KifuLite } from 'kifu-for-js';
import { KifuStoreState } from '@/app/lib/common';

const KifuForJS = ({ kifuStoreState }: { kifuStoreState: KifuStoreState }) => {
    return (
    <KifuLite
      kifuStore={ kifuStoreState.kifuStore }
      style={{
        border: "1px black solid"
      }}
    />
  );
}

export default KifuForJS;
