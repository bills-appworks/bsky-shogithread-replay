import { KifuLite } from 'kifu-for-js';
import { ReplayState } from '@/app/lib/common';

const KifuForJS = ({ replayState }: { replayState: ReplayState }) => {
  return (
    <KifuLite
      kifuStore={ replayState.kifuStore }
      style={{
        border: "1px black solid"
      }}
    />
  );
}

export default KifuForJS;
