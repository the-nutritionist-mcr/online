import { FC, useState } from "react";
import toast from "react-hot-toast";
import { apiRequest } from "../../../core/api-request";
import { BackendCustomer } from "@tnmo/types";
import MainButton from "@/components/ui/main-button";
import { DateTime } from "luxon";
import { useMe } from "@/hooks/use-me";

interface SchedulePauseButtonProps {
  pauseDate: DateTime | null;
  resumeDate: DateTime | null;
  handlePauseSelection: () => void;
}

const SchedulePauseButton: FC<SchedulePauseButtonProps> = ({
  pauseDate,
  resumeDate,
}) => {
  const user = useMe();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    if (!pauseDate || !resumeDate || !user) return;
    setLoading(true);
    await Promise.all(
      user.plans.map(
        async (plan) => await pausePlan(plan.id, pauseDate, resumeDate)
      )
    );
  };

  const pausePlan = async (
    planId: string,
    pauseDate: DateTime,
    resumeDate: DateTime
  ) => {
    try {
      await apiRequest<BackendCustomer>("chargebee-pause-plan", {
        method: "POST",
        body: JSON.stringify({
          plan_id: planId,
          pause_date: pauseDate.toUnixInteger(),
          resume_date: resumeDate.toUnixInteger(),
        }),
      });
      toast.success("Your pause was successfully submitted");
    } catch (error) {
      toast.error(
        "There was an error submitting your pause. Please get in touch with us at hello@thenutritionistmcr.com"
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MainButton
        disabled={!!(!pauseDate && !user) || loading}
        loading={loading}
        onClick={() => handleClick()}
      >
        {loading ? "Scheduling..." : "Schedule this pause"}
      </MainButton>
    </>
  );
};

export default SchedulePauseButton;
