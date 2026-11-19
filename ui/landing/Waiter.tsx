export type WaiterProps = {
  src: string;
};

export function Waiter(p: WaiterProps) {
  return (
    <div className="sr-waiter" aria-hidden="true">
      <span className="sr-waiter__ring" />
      <div className="sr-waiter__slap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} alt="" draggable={false} />
      </div>
    </div>
  );
}
