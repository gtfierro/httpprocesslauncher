/**
This is a simple little server designed to make it easy to start and stop sMAP zone controllers via a
dumb web interface that has buttons on it. Zone controllers are defined by a .ini and .py file pair. If they
are in a certain (specified) directory, then we can click "start" or "stop" on the web interface and the zone
controller will start or stop accordingly.
**/
package main

import (
	"encoding/json"
	"github.com/julienschmidt/httprouter"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

var processes = make(map[string]*exec.Cmd)

func getValidControllers() []string {
	inifound, err := filepath.Glob("zc/*.ini")
	if err != nil {
		log.Fatal(err)
	}
	return inifound
}

func runController(ini string) {
	cmd := exec.Command("twistd", "-n", "smap", ini)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	processes[ini] = cmd
	err := cmd.Start()
	if err != nil {
		log.Fatal(err)
	}
	err = cmd.Wait()
	log.Println(err)
}

func List(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	defer r.Body.Close()
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fixlist := []string{}
	for _, controller := range getValidControllers() {
		tmp := strings.Split(controller[3:], ".")
		fixlist = append(fixlist, tmp[0])
	}
	bytes, _ := json.Marshal(fixlist)
	w.WriteHeader(200)
	w.Write(bytes)
}

func Run(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	defer r.Body.Close()
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	byte_choice, _ := ioutil.ReadAll(r.Body)
	choice := string(byte_choice)
	log.Printf("Starting %v", choice)
	go runController("zc/" + choice + ".ini")
}

func Kill(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	defer r.Body.Close()
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	byte_choice, _ := ioutil.ReadAll(r.Body)
	choice := "zc/" + string(byte_choice) + ".ini"
	if cmd, found := processes[choice]; found {
		log.Printf("Stopping %v", choice)
		cmd.Process.Signal(os.Interrupt)
		time.Sleep(1 * time.Second)
		if !cmd.ProcessState.Exited() {
			log.Println("killing")
			cmd.Process.Kill()
		}
		delete(processes, choice)
	} else {
		log.Fatal("no found", choice)
	}
}

func Status(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	defer r.Body.Close()
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	tmp_choice := p.ByName("pname")
	choice := "zc/" + tmp_choice + ".ini"
	_, found := processes[choice]
	bytes, _ := json.Marshal(map[string]bool{"alive": found})
	w.WriteHeader(200)
	w.Write(bytes)
}

func Home(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	http.ServeFile(w, r, "index.html")
}

func Static(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	http.ServeFile(w, r, r.URL.Path[1:])
}

func main() {
	log.Println("Found the following controller files")
	for _, f := range getValidControllers() {
		log.Printf("-> %q", f)
	}
	//runController(getValidControllers()[0])

	router := httprouter.New()
	router.GET("/list", List)
	router.POST("/run", Run)
	router.POST("/kill", Kill)
	router.GET("/status/:pname", Status)
	router.GET("/", Home)
	router.GET("/build/*file", Static)
	log.Fatal(http.ListenAndServe(":8000", router))
}
