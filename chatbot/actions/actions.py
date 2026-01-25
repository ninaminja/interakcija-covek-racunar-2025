
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import unicodedata
from datetime import datetime


def normalize(text: str) -> str:
    if not text:
        return ""
    return (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("utf-8")
        .lower()
    )


# -------------------------
# BASIC
# -------------------------

class ActionHelloWorld(Action):
    def name(self) -> Text:
        return "action_hello_world"

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text="Zdravo od Toys Bota! 🧸")
        return []


# -------------------------
# TOYS
# -------------------------

class ActionLatestToys(Action):
    def name(self) -> Text:
        return "action_latest_toys"

    def run(self, dispatcher, tracker, domain):
        url = 'https://toy.pequla.com/api/toy'
        try:
            rsp = requests.get(url)
            toys = rsp.json()

            if toys and len(toys) >= 3:
                dispatcher.utter_message(
                    text="Evo nekoliko igračaka:",
                    attachment={
                        "type": "toy_list",
                        "data": toys[-3:]  # Poslednje 3 igračke
                    }
                )
            else:
                dispatcher.utter_message(text="Nema dovoljno igračaka.")
        except Exception as e:
            dispatcher.utter_message(text=f"Greška pri učitavanju: {str(e)}")
        return []


# -------------------------
# TYPES & AGE GROUPS
# -------------------------

class ActionTypeList(Action):
    def name(self) -> Text:
        return "action_type_list"

    def run(self, dispatcher, tracker, domain):
        url = 'https://toy.pequla.com/api/type'
        try:
            rsp = requests.get(url)
            types = rsp.json()

            dispatcher.utter_message(
                text="Dostupni tipovi igračaka:",
                attachment={
                    "type": "type_list",
                    "data": types
                }
            )
        except Exception as e:
            dispatcher.utter_message(text=f"Greška: {str(e)}")
        return []


class ActionAgeGroupList(Action):
    def name(self) -> Text:
        return "action_age_group_list"

    def run(self, dispatcher, tracker, domain):
        url = 'https://toy.pequla.com/api/age-group'
        try:
            rsp = requests.get(url)
            age_groups = rsp.json()

            dispatcher.utter_message(
                text="Dostupne starosne grupe:",
                attachment={
                    "type": "age_group_list",
                    "data": age_groups
                }
            )
        except Exception as e:
            dispatcher.utter_message(text=f"Greška: {str(e)}")
        return []


# -------------------------
# FILTER BY TYPE
# -------------------------

class ActionSelectToyType(Action):
    def name(self) -> Text:
        return "action_select_toy_type"

    def run(self, dispatcher, tracker, domain):
        criteria = tracker.get_slot("type_criteria")
        
        if not criteria:
            dispatcher.utter_message(text="Koji tip igračaka vas interesuje?")
            return []

        try:
            rsp = requests.get('https://toy.pequla.com/api/type')
            types = rsp.json()

            matched = []
            norm_criteria = normalize(criteria)

            for t in types:
                if norm_criteria in normalize(t.get('name', '')):
                    matched.append(t)

            if matched:
                selected = matched[0]
                dispatcher.utter_message(text=f"Odabrani tip: {selected['name']}")
                return [SlotSet("type_id", selected['typeId'])]
            else:
                dispatcher.utter_message(text=f"Tip '{criteria}' nije pronađen.")
                
        except Exception as e:
            dispatcher.utter_message(text=f"Greška: {str(e)}")
        return []


# -------------------------
# FILTER BY AGE
# -------------------------

class ActionSelectAgeGroup(Action):
    def name(self) -> Text:
        return "action_select_age_group"

    def run(self, dispatcher, tracker, domain):
        criteria = tracker.get_slot("age_criteria")
        
        if not criteria:
            dispatcher.utter_message(text="Za koju starosnu grupu?")
            return []

        try:
            rsp = requests.get('https://toy.pequla.com/api/age-group')
            age_groups = rsp.json()

            matched = []
            norm_criteria = normalize(criteria)

            for ag in age_groups:
                if norm_criteria in normalize(ag.get('name', '')):
                    matched.append(ag)

            if matched:
                selected = matched[0]
                dispatcher.utter_message(text=f"Odabrana starosna grupa: {selected['name']}")
                return [SlotSet("age_group_id", selected['ageGroupId'])]
            else:
                dispatcher.utter_message(text=f"Starosna grupa '{criteria}' nije pronađena.")
                
        except Exception as e:
            dispatcher.utter_message(text=f"Greška: {str(e)}")
        return []


# -------------------------
# RECOMMEND BY TYPE / AGE
# -------------------------

class ActionRecommendToys(Action):
    def name(self) -> Text:
        return "action_recommend_toys"

    def run(self, dispatcher, tracker, domain):
        type_id = tracker.get_slot("type_id")
        age_group_id = tracker.get_slot("age_group_id")

        if not type_id and not age_group_id:
            dispatcher.utter_message(text="Molimo odaberite tip ili starosnu grupu.")
            return []

        url = 'https://toy.pequla.com/api/toy?'

        if type_id:
            url += f'type={type_id}&'
        if age_group_id:
            url += f'ageGroup={age_group_id}&'

        try:
            rsp = requests.get(url)
            toys = rsp.json()

            if toys:
                dispatcher.utter_message(
                    text="Preporučene igračke:",
                    attachment={
                        "type": "toy_list",
                        "data": toys[:5]  # Prvih 5
                    }
                )
            else:
                dispatcher.utter_message(text="Nema igračaka za date kriterijume.")
                
        except Exception as e:
            dispatcher.utter_message(text=f"Greška: {str(e)}")
        return []


# -------------------------
# TOY DETAILS - ISPRAVLJENA VERZIJA
# -------------------------

class ActionExtractToy(Action):
    def name(self) -> Text:
        return "action_extract_toy"

    def run(self, dispatcher, tracker, domain):
        criteria = tracker.get_slot("toy_criteria")

        if not criteria:
            dispatcher.utter_message(text="Koja igračka vas interesuje?")
            return []

        # Dobijamo sve igračke
        url = f'https://toy.pequla.com/api/toy'
        try:
            rsp = requests.get(url)
            all_toys = rsp.json()

            if not all_toys:
                dispatcher.utter_message(text="Trenutno nema dostupnih igračaka.")
                return []

            # Normalizujemo kriterijum za pretragu
            norm_criteria = normalize(criteria)
            found_toys = []
            
            # Tražimo sve igračke koje odgovaraju kriterijumu
            for toy in all_toys:
                # Proveravamo u nazivu
                if norm_criteria in normalize(toy.get('name', '')):
                    found_toys.append(toy)
                # Proveravamo u opisu
                elif toy.get('description') and norm_criteria in normalize(toy.get('description', '')):
                    found_toys.append(toy)

            if found_toys:
                if len(found_toys) == 1:
                    # Ako je samo jedna igračka pronađena, prikaži detalje
                    toy = found_toys[0]
                    dispatcher.utter_message(
                        text=f"Detalji o igrački: {toy['name']}",
                        attachment={
                            "type": "toy_details",
                            "data": toy
                        }
                    )
                    # Čuvamo podatke za kasnije naručivanje
                    return [
                        SlotSet("toy_permalink", toy.get("permalink", "")),
                        SlotSet("toy_name", toy.get("name", "")),
                        SlotSet("toy_price", toy.get("price", 0))
                    ]
                else:
                    # Ako je više igračaka pronađeno, prikaži listu
                    dispatcher.utter_message(
                        text=f"Pronađeno {len(found_toys)} igračaka za '{criteria}':",
                        attachment={
                            "type": "toy_list",
                            "data": found_toys[:10]  # Ograničimo na 10
                        }
                    )
                    return []
            else:
                dispatcher.utter_message(text=f"Igračka '{criteria}' nije pronađena.")
                
        except Exception as e:
            dispatcher.utter_message(text=f"Greška: {str(e)}")
        return []


# -------------------------
# ORDER (SIMPLE EXAMPLE)
# -------------------------

class ActionListOrder(Action):
    def name(self) -> Text:
        return "action_list_order"

    def run(self, dispatcher, tracker, domain):
        toy = tracker.get_slot("toy_permalink")
        type_id = tracker.get_slot("type_id")
        age_group_id = tracker.get_slot("age_group_id")

        order = []
        if toy:
            order.append(f"Igračka: {toy}")
        if type_id:
            order.append(f"Tip ID: {type_id}")
        if age_group_id:
            order.append(f"Starosna grupa ID: {age_group_id}")

        if order:
            dispatcher.utter_message(
                text="Vaša trenutna porudžbina:",
                attachment={
                    "type": "simple_list",
                    "data": order
                }
            )
        else:
            dispatcher.utter_message(text="Porudžbina je prazna.")
        return []


class ActionPlaceOrder(Action):
    def name(self) -> Text:
        return "action_place_order"

    def run(self, dispatcher, tracker, domain):
        toy_permalink = tracker.get_slot("toy_permalink")
        toy_name = tracker.get_slot("toy_name")
        toy_price = tracker.get_slot("toy_price")
        type_id = tracker.get_slot("type_id")
        age_group_id = tracker.get_slot("age_group_id")

        if not toy_name:
            # Proverimo da li je korisnik rekao "order [something]"
            last_message = tracker.latest_message.get('text', '').lower()
            if 'order' in last_message or 'buy' in last_message or 'purchase' in last_message:
                # Pokušajmo da pronađemo igračku iz poruke
                import re
                match = re.search(r'order\s+(.+)$|buy\s+(.+)$|purchase\s+(.+)$', last_message)
                if match:
                    toy_from_message = match.group(1) or match.group(2) or match.group(3)
                    toy_name = toy_from_message
                    dispatcher.utter_message(text=f"Tražim '{toy_name}'...")
                    # Ovde možete dodati logiku za pretragu
                else:
                    dispatcher.utter_message(text="Molimo prvo izaberite igračku koju želite da naručite.")
                    return []
            else:
                dispatcher.utter_message(text="Molimo prvo izaberite igračku koju želite da naručite.")
                return []

        order_details = {
            "igračka": toy_name,
            "permalink": toy_permalink if toy_permalink else "N/A",
            "cena": f"{toy_price} RSD" if toy_price else "Na upit",
            "tip": type_id if type_id else "Nije odabran",
            "starosna_grupa": age_group_id if age_group_id else "Nije odabrana",
             "vreme_narudžbine": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "broj_narudžbine": f"ORD-{int(datetime.now().timestamp())}"
        }

        dispatcher.utter_message(
            text="✅ Vaša porudžbina je uspešno kreirana!",
            attachment={
                "type": "create_order",
                "data": order_details
            }
        )
        
        # Resetujemo slotove nakon narudžbine
        return [
            SlotSet("toy_permalink", None),
            SlotSet("toy_name", None),
            SlotSet("toy_price", None)
        ]


class ActionBetterSearch(Action):
    def name(self) -> Text:
        return "action_better_search"

    def run(self, dispatcher, tracker, domain):
        criteria = tracker.get_slot("search_criteria")
        
        if not criteria:
            dispatcher.utter_message(text="Koje igračke tražite?")
            return []

        # 1. Pokušaj direktno sa API
        url_direct = f'https://toy.pequla.com/api/toy'
        all_toys = []
        
        try:
            # Prvo uzmemo sve igračke
            rsp_all = requests.get(url_direct, timeout=10)
            all_toys = rsp_all.json()
            
            if not all_toys:
                dispatcher.utter_message(text="Trenutno nema dostupnih igračaka.")
                return []
            
            # Normalizujemo kriterijum
            norm_criteria = normalize(criteria)
            filtered_toys = []
            
            # Detaljna pretraga
            for toy in all_toys:
                # Proveravamo u nazivu
                if norm_criteria in normalize(toy.get('name', '')):
                    filtered_toys.append(toy)
                # Proveravamo u opisu
                elif toy.get('description') and norm_criteria in normalize(toy.get('description', '')):
                    filtered_toys.append(toy)
                # Proveravamo u tipu
                elif toy.get('type') and toy['type'].get('name') and norm_criteria in normalize(toy['type']['name']):
                    filtered_toys.append(toy)
                # Proveravamo u starosnoj grupi
                elif toy.get('ageGroup') and toy['ageGroup'].get('name') and norm_criteria in normalize(toy['ageGroup']['name']):
                    filtered_toys.append(toy)

            # Dodatno: ako je pretraga specifična (npr. "lego set"), tražimo i po pojedinačnim rečima
            if len(filtered_toys) == 0 and ' ' in criteria:
                words = criteria.split()
                for word in words:
                    norm_word = normalize(word)
                    for toy in all_toys:
                        if norm_word in normalize(toy.get('name', '')):
                            if toy not in filtered_toys:
                                filtered_toys.append(toy)
                        elif toy.get('description') and norm_word in normalize(toy.get('description', '')):
                            if toy not in filtered_toys:
                                filtered_toys.append(toy)

            if filtered_toys:
                dispatcher.utter_message(
                    text=f"Pronađeno {len(filtered_toys)} igračaka za '{criteria}':",
                    attachment={
                        "type": "toy_list",
                        "data": filtered_toys[:15]  # Ograničimo na 15
                    }
                )
            else:
                # Prikaži sve igračke sa sugestijom
                dispatcher.utter_message(
                    text=f"Nisam pronašao '{criteria}'. Evo svih dostupnih igračaka:",
                    attachment={
                        "type": "toy_list",
                        "data": all_toys[:10]
                    }
                )
                
        except Exception as e:
            print(f"Error in better search: {str(e)}")
            dispatcher.utter_message(text=f"Greška pri pretrazi: {str(e)}")
        
        return []
