"use client";

type Transport = "cycling" | "driving";

interface MapTransportSelectorProps {
  transport: Transport;
  setTransport: (transport: Transport) => void;
  isDisplayOnly: boolean;
}

export const MapTransportSelector = ({
  transport,
  setTransport,
  isDisplayOnly,
}: MapTransportSelectorProps) => {
  return (
    <>
      {!isDisplayOnly && (
        <div className="absolute flex bottom-3 right-3 bg-white shadow-md border rounded border-gray-300 transition cursor-pointer">
          <span
            className={`w-9 h-9 mx-auto text-center text-2xl border-r-2 hover:bg-gray-200 ${
              transport === "cycling" && "bg-gray-200"
            }`}
            onClick={() => setTransport("cycling")}
          >
            🚲
          </span>
          <span
            className={`w-9 h-9 text-2xl text-center mx-auto hover:bg-gray-200 ${
              transport !== "cycling" && "bg-gray-200"
            }`}
            onClick={() => setTransport("driving")}
          >
            🏍️
          </span>
        </div>
      )}
    </>
  );
};
