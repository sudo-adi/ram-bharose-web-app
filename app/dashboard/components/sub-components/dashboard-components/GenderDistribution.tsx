import { Progress } from "@/components/ui/progress";

type GenderDistributionProps = {
  maleCount: number;
  femaleCount: number;
  otherCount: number;
};

export function GenderDistribution({
  maleCount,
  femaleCount,
  otherCount,
}: GenderDistributionProps) {
  const total = maleCount + femaleCount + otherCount;

  const malePercentage = total > 0 ? Math.round((maleCount / total) * 100) : 0;
  const femalePercentage =
    total > 0 ? Math.round((femaleCount / total) * 100) : 0;
  const otherPercentage =
    total > 0 ? Math.round((otherCount / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm font-medium">Male</span>
          </div>
          <span className="text-sm font-medium">
            {maleCount} ({malePercentage}%)
          </span>
        </div>
        <Progress value={malePercentage} className="h-2 bg-gray-100" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
            <span className="text-sm font-medium">Female</span>
          </div>
          <span className="text-sm font-medium">
            {femaleCount} ({femalePercentage}%)
          </span>
        </div>
        <Progress value={femalePercentage} className="h-2 bg-gray-100" />
      </div>

      {otherCount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm font-medium">Other</span>
            </div>
            <span className="text-sm font-medium">
              {otherCount} ({otherPercentage}%)
            </span>
          </div>
          <Progress value={otherPercentage} className="h-2 bg-gray-100" />
        </div>
      )}

      <div className="pt-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Members: {total}</span>
          <span>Updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
