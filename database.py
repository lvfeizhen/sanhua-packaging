# -*- coding: utf-8 -*-
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'packaging.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS packaging_specs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spec_number TEXT NOT NULL,
        product_model TEXT NOT NULL,
        description TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS spec_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spec_id INTEGER NOT NULL,
        seq_number INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        valve_model TEXT NOT NULL,
        special_note TEXT,
        remark TEXT,
        FOREIGN KEY (spec_id) REFERENCES packaging_specs(id)
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS spec_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spec_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        page_number INTEGER,
        FOREIGN KEY (spec_id) REFERENCES packaging_specs(id)
    )''')

    conn.commit()
    conn.close()

def import_data():
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM packaging_specs")
    if c.fetchone()[0] > 0:
        conn.close()
        return

    # ============ S-01BS163: HDF(10/15)HM ============
    c.execute("INSERT INTO packaging_specs (spec_number, product_model, description) VALUES (?, ?, ?)",
              ("S-01BS163", "HDF(10/15)HM", "电磁阀阀体包装仕样书"))
    spec1_id = c.lastrowid

    for seq, cust, model, note, remark in [
        (1, "美国三花小包装", "HDF10HM01", "", ""),
        (2, "美国三花小包装", "HDF10HM02", "", ""),
        (3, "美国三花小包装", "HDF15HM01", "", ""),
    ]:
        c.execute("INSERT INTO spec_entries (spec_id, seq_number, customer_name, valve_model, special_note, remark) VALUES (?,?,?,?,?,?)",
                  (spec1_id, seq, cust, model, note, remark))

    c.execute("INSERT INTO spec_images (spec_id, image_path, page_number) VALUES (?,?,?)",
              (spec1_id, "static/images/spec_1_page1.png", 1))
    c.execute("INSERT INTO spec_images (spec_id, image_path, page_number) VALUES (?,?,?)",
              (spec1_id, "static/images/spec_2_page2.png", 2))

    # ============ S-01BS162: HDF6HM ============
    c.execute("INSERT INTO packaging_specs (spec_number, product_model, description) VALUES (?, ?, ?)",
              ("S-01BS162", "HDF6HM", "电磁阀阀体包装仕样书"))
    spec2_id = c.lastrowid

    for seq, cust, model, note, remark in [
        (1, "美国三花小包装", "HDF6HM02", "", ""),
        (2, "美国三花小包装", "HDF6HM03", "", ""),
    ]:
        c.execute("INSERT INTO spec_entries (spec_id, seq_number, customer_name, valve_model, special_note, remark) VALUES (?,?,?,?,?,?)",
                  (spec2_id, seq, cust, model, note, remark))

    c.execute("INSERT INTO spec_images (spec_id, image_path, page_number) VALUES (?,?,?)",
              (spec2_id, "static/images/spec_3_page2.png", 2))
    c.execute("INSERT INTO spec_images (spec_id, image_path, page_number) VALUES (?,?,?)",
              (spec2_id, "static/images/spec_4_page1.png", 1))

    # ============ S-33BS464: HDF/KDF(3-6)H 小包装 ============
    c.execute("INSERT INTO packaging_specs (spec_number, product_model, description) VALUES (?, ?, ?)",
              ("S-33BS464", "HDF/KDF(3-6)H", "HDF/KDF小套管系列(3-6)H电磁阀小包装客户清单"))
    spec3_id = c.lastrowid

    for seq, cust, model, note, remark in [
        (1, "北京三花制冷", "KDF6H01", "", ""),
        (2, "成都天奇", "KDF6H01", "", ""),
        (3, "成都天奇", "KDF6H03", "", ""),
        (4, "东莞三江", "KDF4H01", "", ""),
        (5, "东莞三江", "KDF6H01", "", ""),
        (6, "俄罗斯MORENA", "KDF4H02", "S-33BS922", ""),
        (7, "佛山三枫", "KDF6H01", "", ""),
        (8, "佛山三枫", "KDF6H02", "", ""),
        (9, "济南百福特", "KDF6H01", "", ""),
        (10, "江苏锦东", "KDF6H01", "", ""),
        (11, "江苏锦东", "KDF6H03", "", ""),
        (12, "江苏联孚", "KDF6H01", "", ""),
        (13, "昆山盛年", "KDF3H01", "", ""),
        (14, "昆山盛年", "KDF6H01", "", ""),
        (15, "欧洲三花（小包装）", "KDF6H01", "S-33BS922", ""),
        (16, "青岛德佰宜", "HDF6H14K", "", ""),
        (17, "三花商贸", "HDF6H02K", "", ""),
        (18, "三花商贸", "KDF6H01", "", ""),
        (19, "深圳市鑫逸生", "HDF6H14K", "", ""),
        (20, "盛年制冷设备（昆山）", "KDF3H01", "", ""),
        (21, "盛年制冷设备（昆山）", "KDF6H01", "", ""),
        (22, "印度EXCELSIOR", "KDF3H05", "S-33BS922", ""),
        (23, "郑州凯雪运输", "HDF6H07K", "", ""),
        (24, "郑州三力", "KDF6H01", "", ""),
        (25, "中山京鹏", "KDF3H02", "", ""),
        (26, "中山京鹏", "KDF6H02", "", ""),
        (27, "重庆长江", "KDF6H01", "", ""),
        (28, "重庆长江", "KDF6H03", "", ""),
        (29, "俄罗斯IMPEX(ROSHOLOD)", "KDF4H01", "S-33BS922", "按欧洲市场发货要求进行（标贴、外箱贴、中英文对照表）"),
    ]:
        c.execute("INSERT INTO spec_entries (spec_id, seq_number, customer_name, valve_model, special_note, remark) VALUES (?,?,?,?,?,?)",
                  (spec3_id, seq, cust, model, note, remark))

    c.execute("INSERT INTO spec_images (spec_id, image_path, page_number) VALUES (?,?,?)",
              (spec3_id, "static/images/spec_5_page1.png", 1))

    # ============ S-33BS769: KDF10-15H 小包装 ============
    c.execute("INSERT INTO packaging_specs (spec_number, product_model, description) VALUES (?, ?, ?)",
              ("S-33BS769-小包装", "KDF10-15H", "KDF10-15H系列电磁阀小包装客户清单"))
    spec4_id = c.lastrowid

    for seq, cust, model, note, remark in [
        (1, "北京三花制冷", "KDF10H01", "", ""),
        (2, "北京三花制冷", "KDF15H01", "", ""),
        (3, "东莞三江", "KDF10H01", "", ""),
        (4, "东莞三江", "KDF15H01", "", ""),
        (5, "江苏联孚", "KDF10H01", "", ""),
        (6, "江苏联孚", "KDF15H01", "", ""),
        (7, "郑州三力", "KDF10H01", "", ""),
        (8, "郑州三力", "KDF15H01", "", ""),
        (9, "上海京汉", "KDF10H01", "", ""),
        (10, "上海京汉", "KDF15H01", "", ""),
        (11, "沈阳先成/广州富懋/上海富懋", "KDF10H01", "", ""),
        (12, "沈阳先成/广州富懋/上海富懋", "KDF15H01", "", ""),
        (13, "欧洲三花（小包装）", "KDF10H01", "", ""),
        (14, "欧洲三花（小包装）", "KDF10H02", "", ""),
        (15, "欧洲三花（小包装）", "KDF10H03", "S-33BS922", "按欧洲市场发货要求进行（标贴、外箱贴、中英文对照表）"),
        (16, "欧洲三花（小包装）", "KDF15H01", "", ""),
        (17, "欧洲三花（小包装）", "KDF15H02", "", ""),
        (18, "上海堃霖", "KDF10H01", "", ""),
        (19, "上海堃霖", "KDF15H01", "", ""),
        (20, "成都精工诚志制冷", "KDF15H01", "", ""),
        (21, "佛山三枫", "KDF10H01", "", ""),
        (22, "佛山三枫", "KDF10H03", "", ""),
        (23, "佛山三枫", "KDF15H01", "", ""),
        (24, "江苏锦东", "KDF10H01", "", ""),
        (25, "江苏锦东", "KDF10H02", "", ""),
        (26, "江苏锦东", "KDF15H01", "", ""),
        (27, "江苏锦东", "KDF15H02", "", ""),
        (28, "江苏联孚", "KDF10H02", "", ""),
        (29, "江苏联孚", "KDF15H02", "", ""),
    ]:
        c.execute("INSERT INTO spec_entries (spec_id, seq_number, customer_name, valve_model, special_note, remark) VALUES (?,?,?,?,?,?)",
                  (spec4_id, seq, cust, model, note, remark))

    c.execute("INSERT INTO spec_images (spec_id, image_path, page_number) VALUES (?,?,?)",
              (spec4_id, "static/images/spec_6_page1.png", 1))

    # ============ S-33BS769: KDF10-15H 大包装 ============
    c.execute("INSERT INTO packaging_specs (spec_number, product_model, description) VALUES (?, ?, ?)",
              ("S-33BS769-大包装", "KDF10-15H", "KDF10-15H系列电磁阀大包装客户清单"))
    spec5_id = c.lastrowid

    for seq, cust, model, note, remark in [
        (1, "广东申菱", "KDF10H01", "S-33BS928", "外箱增加客户料号表"),
        (2, "广东申菱", "KDF15H01", "S-33BS928", "外箱增加客户料号表"),
        (3, "上海鑫天科技", "KDF10H01", "", ""),
    ]:
        c.execute("INSERT INTO spec_entries (spec_id, seq_number, customer_name, valve_model, special_note, remark) VALUES (?,?,?,?,?,?)",
                  (spec5_id, seq, cust, model, note, remark))

    c.execute("INSERT INTO spec_images (spec_id, image_path, page_number) VALUES (?,?,?)",
              (spec5_id, "static/images/spec_7_page1.png", 1))

    conn.commit()
    conn.close()
    print("数据库初始化完成，数据导入成功！")

if __name__ == '__main__':
    init_db()
    import_data()
