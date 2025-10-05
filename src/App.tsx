import "./App.css";
import { Button } from "@/components/ui/button";
import { ReactMediaRecorder } from "react-media-recorder";
import { Label } from "./components/ui/label";
import axios from "axios";
import { useEffect, useState } from "react";
import { MicIcon, SquareStopIcon } from "lucide-react";
import prettyPrint from "pretty-print-ms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Item, ItemContent, ItemMedia, ItemTitle } from "./components/ui/item";
import { Spinner } from "./components/ui/spinner";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "./components/ui/field";
import { Switch } from "./components/ui/switch";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

function App() {
  const [status, setStatus] = useState("idle");
  const [transcription, setTranscription] = useState("");
  const [time, setTime] = useState(0);
  const [start, setStart] = useState(false);
  //------------Settings-------------//
  const [settingsLanguage, setSettingsLanguage] = useState("en");
  const [shouldDiarize, setShouldDiarize] = useState(false);
  const [speakers, setSpeakers] = useState(1);
  const [shouldGenerateSummary, setShouldGenerateSummary] = useState(false);

  useEffect(() => {
    let interval = null;
    if (start) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 100);
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [start]);

  const renderAudio = (blob) => {
    if ("stopped" === status && blob) {
      return <audio className="w-full max-w-lg" src={blob} controls />;
    }
  };
  const renderControls = (status, startRecording, stopRecording) => {
    if ("recording" === status) {
      return (
        <div className="flex w-32 justify py-2">
          <div
            onClick={() => {
              setStart(false);
              setTime(0);
              stopRecording();
            }}
          >
            <SquareStopIcon className="mr-2 flex-auto" color="red" size={48} />
          </div>
          <Label className="">{prettyPrint(time)}</Label>
        </div>
      );
    }
    return (
      <div
        className="py-2"
        onClick={() => {
          setStart(true);
          startRecording();
        }}
      >
        <MicIcon size={48} />
      </div>
    );
  };
  const renderTranscription = () => {
    if (transcription) {
      return (
        <div
          className="text-start"
          dangerouslySetInnerHTML={{ __html: transcription }}
        ></div>
      );
    } else {
      return (
        <div className="flex w-full max-w-fit flex-col gap-4 [--radius:1rem]">
          <Item variant="muted">
            <ItemMedia>
              <Spinner />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                Generating transcription...
              </ItemTitle>
            </ItemContent>
          </Item>
        </div>
      );
    }
  };
  const renderAccordion = () => {
    if ("stopped" !== status) {
      return;
    }
    return (
      <Accordion type="single" collapsible className="w-full max-w-lg">
        <AccordionItem value="item-1">
          <AccordionTrigger>Transcription</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            {renderTranscription()}
          </AccordionContent>
        </AccordionItem>
        {(() => {
          if (!shouldGenerateSummary) {
            return;
          }
          return (
            <AccordionItem value="item-2">
              <AccordionTrigger>Summary</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <div className="flex w-full max-w-fit flex-col gap-4 [--radius:1rem]">
                  <Item variant="muted">
                    <ItemMedia>
                      <Spinner />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="line-clamp-1">
                        Generating summary...
                      </ItemTitle>
                    </ItemContent>
                  </Item>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })()}
      </Accordion>
    );
  };
  const renderSettings = () => {
    return (
      <Card className="w-full max-w-lg py-0">
        <CardContent>
          <Accordion type="single" collapsible className="">
            <AccordionItem value="item-1">
              <AccordionTrigger>Settings</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <FieldGroup>
                  <Field orientation="horizontal">
                    <FieldLabel
                      htmlFor="settings-language"
                      className="font-normal"
                    >
                      Language
                    </FieldLabel>
                    <Select
                      value={settingsLanguage}
                      onValueChange={setSettingsLanguage}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <FieldSeparator />
                <FieldGroup>
                  <Field orientation="horizontal">
                    <FieldLabel
                      htmlFor="settings-speaker-recognition"
                      className="font-normal"
                    >
                      Speaker recognition
                    </FieldLabel>
                    <Switch
                      id="settings-speaker-recognition"
                      checked={shouldDiarize}
                      onCheckedChange={setShouldDiarize}
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup className={`${shouldDiarize ? "block" : "hidden"}`}>
                  <Field orientation="horizontal">
                    <FieldLabel
                      htmlFor="settings-speaker-amount"
                      className="font-normal"
                    >
                      Amount of Speakers
                    </FieldLabel>
                    <Input
                      id="settings-speaker-amount"
                      className="w-[60px]"
                      value={speakers}
                      onChange={(event) => setSpeakers(event?.target.value)}
                    />
                  </Field>
                </FieldGroup>
                <FieldSeparator />
                <FieldGroup>
                  <Field orientation="horizontal">
                    <FieldLabel
                      htmlFor="settings-generate-summary"
                      className="font-normal"
                    >
                      Generate summary
                    </FieldLabel>
                    <Switch
                      id="settings-generate-summary"
                      checked={shouldGenerateSummary}
                      onCheckedChange={setShouldGenerateSummary}
                    />
                  </Field>
                </FieldGroup>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    );
  };
  const upload = (_, blob) => {
    setStatus("stopped");
    let data = new FormData();
    data.append("audio_file", blob, "recording.wav");

    const config = {
      headers: {
        "content-type": "multipart/form-data",
        "Access-Control-Allow-Origin": "*",
      },
    };
    let pathParams = "encode=true&task=transcribe&output=txt";
    if (settingsLanguage) {
      pathParams = pathParams + "&language=" + settingsLanguage;
    }
    if (shouldDiarize) {
      pathParams =
        pathParams +
        "&diarize=true&max_speakers=" +
        speakers +
        "&min_speakers=" +
        speakers;
    }
    console.log("Sending request with params", pathParams);
    axios
      .post("http://app-prd01.marinos.com:9010/asr?" + pathParams, data, config)
      .then((res) => {
        console.log(res);
        setTranscription(res.data.replace(/\n/g, "<br />"));
      })
      .catch(console.error);
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        {renderSettings()}
        <ReactMediaRecorder
          audio
          onStop={upload}
          onStart={() => {
            setStatus("recording");
          }}
          render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
            <>
              {renderControls(status, startRecording, stopRecording)}
              {renderAudio(mediaBlobUrl)}
            </>
          )}
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        {renderAccordion()}
      </div>
    </>
  );
}

export default App;
